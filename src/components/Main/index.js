import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Segment,
  Item,
  Dropdown,
  Divider,
  Button,
  Message,
  Input,
  Label
} from 'semantic-ui-react';
//import { CSA_EXAM } from '../../constants/CSA';

import mindImg from '../../images/mind.svg';

import {
  CATEGORIES,
  NUM_OF_QUESTIONS,
  DIFFICULTY,
  QUESTIONS_TYPE,
  COUNTDOWN_TIME,
  CAD_EXAM,
  CSA_EXAM,
  SHUFFLE,
  EXAMS
} from '../../constants';
import { shuffle } from '../../utils';

import Offline from '../Offline';

const Main = ({ startQuiz }) => {
  const [category, setCategory] = useState(1);
  const [exam, setExam] = useState("CSA");
  const [dynamicExams, setDynamicExams] = useState(EXAMS);

  useEffect(() => {
    fetch('/api/list-exams')
      .then(r => r.json())
      .then(data => { if (data.exams) setDynamicExams(data.exams); })
      .catch(() => {});
  }, []);
  const [numOfQuestions, setNumOfQuestions] = useState(60);
  const [difficulty, setDifficulty] = useState('easy');
  const [questionsType, setQuestionsType] = useState('0');
  const [doShuffle, setShuffle] = useState('no');
  const [fromVal, setFromVal] = useState(1);
  const [toVal, setToVal] = useState(60);
  const [countdownTime, setCountdownTime] = useState({
    hours: 3600,
    minutes: 1800,
    seconds: 0,
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  const handleTimeChange = (e, { name, value }) => {
    setCountdownTime({ ...countdownTime, [name]: value });
  };

  let allFieldsSelected = false;
  if (
    exam &&
    numOfQuestions &&
    doShuffle &&
    difficulty &&
    questionsType &&
    (countdownTime.hours || countdownTime.minutes || countdownTime.seconds)
  ) {
    allFieldsSelected = true;
  }

  const fetchData =async () => {
    

    if (error) setError(null);
    let data={};
    
    const response = await fetch('/api/upload-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename: `${exam}.json`, type:"json" }), // Pass the filename to fetch the JSON data
    });

    if (response.ok) {
       data = await response.json();
    }


    // if(category===1){
    //  /// const response = await fetch('/exams/CSA.json');
    //   const response = await fetch(`/api/upload-json?filename=CSA.json`);
    //   data = await response.json();
    // }
    // else if (category===2){
    //   const response = await fetch('/exams/CAD.json');
    //   data = await response.json()
    // }
    // else if (category===3){
    //   const response = await fetch('/exams/ITSM.json');
    //   data = await response.json()
    
    // else{
    //   alert("Not yet implemented, please wait or try again later");
    //   return;
    // }

    setProcessing(true);
    //const API = `https://opentdb.com/api.php?amount=${numOfQuestions}&category=${category}&difficulty=${difficulty}&type=${questionsType}`;

    // fetch(API)
    //   .then(respone => respone.json())
    //   .then(data =>
        
          const { response_code, results } = data;

          if (response_code === 404) {
            const message = (
              <p>
                The API doesn't have enough questions for your query. (Ex.
                Asking for 50 Questions in a Category that only has 20.)
                <br />
                <br />
                Please change the <strong>No. of Questions</strong>,{' '}
                <strong>Difficulty Level</strong>, or{' '}
                <strong>Type of Questions</strong>.
              </p>
            );

            setProcessing(false);
            setError({ message });

            return;
          }

          
          results.forEach(element => {
            const options=[...new Set([...element.correct_answers ,...element.incorrect_answers])];
            element.options = shuffle(options);
          });
          
          let resultsMixed=doShuffle=="yes"?shuffle(results):results.slice(fromVal-1,toVal);
          resultsMixed.length=doShuffle=="yes"?numOfQuestions:resultsMixed.length;

          setProcessing(false);
          startQuiz(
            resultsMixed,
            countdownTime.hours + countdownTime.minutes + countdownTime.seconds
          );
      // )
      // .catch(error =>
      //   setTimeout(() => {
      //     if (!navigator.onLine) {
      //       setOffline(true);
      //     } else {
      //       setProcessing(false);
      //       setError(error);
      //     }
      //   }, 1000)
      // );
  };

  const preventNegativeValues = (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()

  if (offline) return <Offline />;

  return (
    <Container>
      <Segment>
        <Item.Group divided>
          <Item>
            <Item.Image src={mindImg} />
            <Item.Content>
              <Item.Header>
                <h1>The ServiceNow Quiz</h1>
              </Item.Header>
              {error && (
                <Message error onDismiss={() => setError(null)}>
                  <Message.Header>Error!</Message.Header>
                  {error.message}
                </Message>
              )}
              <Divider />
              <Item.Meta>
                <p>Select Exam?</p>
                <Dropdown
                  fluid
                  selection
                  name="exam"
                  placeholder="Select Exam"
                  header="Select Exam"
                  options={dynamicExams}
                  value={exam}
                  onChange={(e, { value }) =>{ 
                    
                    setExam(value)

                  }}
                  disabled={processing}
                />
                <br />
                <p>Shuffle?</p>
                <Dropdown
                  search
                  selection
                  name="doShuffle"
                  placeholder="Select Shuffle"
                  header="Select Shuffle"
                  options={SHUFFLE}
                  value={doShuffle}
                  onChange={(e, { value }) => setShuffle(value)}
                  disabled={processing}
                />
                {
                doShuffle=="no"?
                (<><Input
                      value={fromVal}
                      onChange={(e, { value }) => setFromVal(value)}
                      label="From Question #"
                      labelPosition='left' type='number' placeholder='From Question #' 
                      min="0"
                      onKeyDown={preventNegativeValues}>
                      
                    </Input><Input
                      value={toVal}
                      onChange={(e, { value }) => setToVal(value)}
                      label="To Question #"
                      placeholder='To Question #'
                      labelPosition='left'
                      type='number'
                      min="0"
                        onKeyDown={preventNegativeValues} /></>):(
                          <><br/><br/><p>How many questions do you want in your quiz? (Mainline - 60)</p>
                <Dropdown
                  search
                  selection
                  name="numOfQ"
                  placeholder="Select No. of Questions"
                  header="Select No. of Questions"
                  options={NUM_OF_QUESTIONS}
                  value={numOfQuestions}
                  onChange={(e, { value }) => setNumOfQuestions(value)}
                  disabled={processing}
                />
               </>
                        )
                }
                <br />
                <br />
                {/* {/* <p>How difficult do you want your quiz to be?</p>
                <Dropdown
                  fluid
                  selection
                  name="difficulty"
                  placeholder="Select Difficulty Level"
                  header="Select Difficulty Level"
                  options={DIFFICULTY}
                  value={difficulty}
                  onChange={(e, { value }) => setDifficulty(value)}
                  disabled={processing}
                />
                <br /> */}
                {/* <p>Which type of questions do you want in your quiz?</p>
                <Dropdown
                  fluid
                  selection
                  name="type"
                  placeholder="Select Questions Type"
                  header="Select Questions Type"
                  options={QUESTIONS_TYPE}
                  value={questionsType}
                  onChange={(e, { value }) => setQuestionsType(value)}
                  disabled={processing}
                />
                <br />  */}
                <p>Please select the countdown time for your quiz. (Mainline - 90)</p>
                <Dropdown
                  search
                  selection
                  name="hours"
                  placeholder="Select Hours"
                  header="Select Hours"
                  options={COUNTDOWN_TIME.hours}
                  value={countdownTime.hours}
                  onChange={handleTimeChange}
                  disabled={processing}
                />
                <Dropdown
                  search
                  selection
                  name="minutes"
                  placeholder="Select Minutes"
                  header="Select Minutes"
                  options={COUNTDOWN_TIME.minutes}
                  value={countdownTime.minutes}
                  onChange={handleTimeChange}
                  disabled={processing}
                />
                <Dropdown
                  search
                  selection
                  name="seconds"
                  placeholder="Select Seconds"
                  header="Select Seconds"
                  options={COUNTDOWN_TIME.seconds}
                  value={countdownTime.seconds}
                  onChange={handleTimeChange}
                  disabled={processing}
                />
              </Item.Meta>
              <Divider />
              <Item.Extra>
                <Button
                  primary
                  size="big"
                  icon="play"
                  labelPosition="left"
                  content={processing ? 'Processing...' : 'Start Now'}
                  onClick={fetchData}
                  disabled={!allFieldsSelected || processing}
                />
              </Item.Extra>
            </Item.Content>
          </Item>
        </Item.Group>
      </Segment>
      <br />
    </Container>
  );
};

Main.propTypes = {
  startQuiz: PropTypes.func.isRequired,
};

export default Main;
