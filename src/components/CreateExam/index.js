import React, { useState } from 'react';
import { extractTextFromPDF } from '../../utils/pdfExtract';
import {
  Container,
  Segment,
  Header,
  Form,
  Button,
  Message,
  Icon,
  Divider,
  Label,
  Table,
  Accordion,
  Grid,
} from 'semantic-ui-react';

const NUM_OPTIONS = [10, 20, 30, 50].map((n) => ({ key: n, text: `${n} questions`, value: n }));

const CreateExam = ({ onBack }) => {
  const [examName, setExamName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(20);
  const [dragActive, setDragActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [generatedResults, setGeneratedResults] = useState(null);
  const [removedIndices, setRemovedIndices] = useState(new Set());
  const [activeIndex, setActiveIndex] = useState(-1);
  const [saving, setSaving] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleGenerate = async () => {
    if (!examName.trim()) { setError('Please enter an exam name.'); return; }
    if (!selectedFile) { setError('Please upload a PDF file.'); return; }

    setError(null);
    setSuccessMsg(null);
    setGeneratedResults(null);
    setRemovedIndices(new Set());
    setLoading(true);

    try {
      const text = await extractTextFromPDF(selectedFile);
      if (!text) throw new Error('No text could be extracted. The PDF may be image-only (scanned).');
      const response = await fetch('/api/create-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, examName: examName.trim(), numQuestions }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate exam.');
      }
      setGeneratedResults(data.results);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRemove = (idx) => {
    setRemovedIndices((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const keptQuestions = generatedResults
    ? generatedResults.filter((_, i) => !removedIndices.has(i))
    : [];

  const handleSave = async () => {
    if (keptQuestions.length === 0) {
      setError('No questions to save. Keep at least one question.');
      return;
    }

    setSaving(true);
    setError(null);

    const examValue = examName.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
    const filename = `${examValue}.json`;
    const payload = { response_code: 1, results: keptQuestions };

    try {
      const uploadRes = await fetch('/api/upload-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content: payload, type: 'upload' }),
      });
      if (!uploadRes.ok) throw new Error('Failed to save exam data.');

      await fetch('/api/list-exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examName: examValue, examText: examName.trim() }),
      });

      setSuccessMsg(`Exam "${examName.trim()}" saved successfully with ${keptQuestions.length} questions! You can now find it in the quiz setup.`);
      setGeneratedResults(null);
      setExamName('');
      setSelectedFile(null);
      setRemovedIndices(new Set());
    } catch (err) {
      setError(err.message || 'Failed to save exam.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const examValue = examName.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
    const payload = { response_code: 1, results: keptQuestions };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examValue}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <Segment>
        <Button icon="arrow left" content="Back" onClick={onBack} basic size="small" style={{ marginBottom: 12 }} />
        <Header as="h2">
          <Icon name="magic" />
          <Header.Content>
            Create Exam with AI
            <Header.Subheader>Upload a PDF study guide and let AI generate quiz questions</Header.Subheader>
          </Header.Content>
        </Header>
        <Divider />

        {successMsg && (
          <Message positive icon>
            <Icon name="check circle" />
            <Message.Content>
              <Message.Header>Success!</Message.Header>
              {successMsg}
            </Message.Content>
          </Message>
        )}

        {error && (
          <Message negative icon>
            <Icon name="exclamation triangle" />
            <Message.Content>{error}</Message.Content>
          </Message>
        )}

        {!generatedResults && (
          <Form>
            <Grid columns={2} stackable>
              <Grid.Row>
                <Grid.Column>
                  <Form.Field required>
                    <label>Exam Name</label>
                    <Form.Input
                      placeholder="e.g. MY_CERT or ServiceNow HRSD"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      disabled={loading}
                    />
                    <small style={{ color: '#888' }}>This becomes the exam key (e.g. MY_CERT.json)</small>
                  </Form.Field>

                  <Form.Field required>
                    <label>Number of Questions to Generate</label>
                    <Form.Select
                      options={NUM_OPTIONS}
                      value={numQuestions}
                      onChange={(_, { value }) => setNumQuestions(value)}
                      disabled={loading}
                    />
                  </Form.Field>
                </Grid.Column>

                <Grid.Column>
                  <Form.Field required>
                    <label>Upload PDF Study Guide</label>
                    <Segment
                      placeholder
                      onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      style={{
                        border: dragActive ? '2px dashed teal' : '2px dashed grey',
                        textAlign: 'center',
                        padding: 20,
                        cursor: 'pointer',
                      }}
                      onClick={() => document.getElementById('ce-file-input').click()}
                    >
                      <Icon name="file pdf outline" size="huge" color={dragActive ? 'teal' : 'grey'} />
                      <p>{dragActive ? 'Drop PDF here!' : 'Drag & drop PDF or click to browse'}</p>
                      {selectedFile && (
                        <Label color="teal" basic>
                          <Icon name="file pdf outline" />
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </Label>
                      )}
                    </Segment>
                    <input
                      id="ce-file-input"
                      type="file"
                      accept=".pdf"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Form.Field>
                </Grid.Column>
              </Grid.Row>
            </Grid>

            <Divider />
            <Button
              primary
              icon="magic"
              content={loading ? 'Generating...' : 'Generate Questions with AI'}
              loading={loading}
              disabled={loading || !examName.trim() || !selectedFile}
              onClick={handleGenerate}
              size="large"
            />
          </Form>
        )}

        {generatedResults && (
          <>
            <Message info>
              <Icon name="info circle" />
              <strong>{keptQuestions.length}</strong> of <strong>{generatedResults.length}</strong> questions selected.
              Remove any questions you don't want before saving.
            </Message>

            <Accordion fluid styled>
              {generatedResults.map((q, i) => {
                const removed = removedIndices.has(i);
                return (
                  <div key={i} style={{ opacity: removed ? 0.4 : 1 }}>
                    <Accordion.Title
                      active={activeIndex === i}
                      index={i}
                      onClick={() => setActiveIndex(activeIndex === i ? -1 : i)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <span>
                        <Icon name="dropdown" />
                        <Label size="mini" color={removed ? 'red' : 'teal'} style={{ marginRight: 8 }}>Q{i + 1}</Label>
                        {q.question.length > 100 ? q.question.slice(0, 100) + '…' : q.question}
                      </span>
                      <Button
                        size="mini"
                        color={removed ? 'green' : 'red'}
                        icon={removed ? 'undo' : 'trash'}
                        content={removed ? 'Restore' : 'Remove'}
                        onClick={(e) => { e.stopPropagation(); toggleRemove(i); }}
                      />
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === i}>
                      <p><strong>Question:</strong> {q.question}</p>
                      <p><strong>Difficulty:</strong> {q.difficulty || 'medium'}</p>
                      <Table compact celled size="small">
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell>Answer</Table.HeaderCell>
                            <Table.HeaderCell>Type</Table.HeaderCell>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {q.correct_answers.map((a, ai) => (
                            <Table.Row key={`c-${ai}`} positive>
                              <Table.Cell>{a}</Table.Cell>
                              <Table.Cell><Label color="green" size="mini">Correct</Label></Table.Cell>
                            </Table.Row>
                          ))}
                          {q.incorrect_answers.map((a, ai) => (
                            <Table.Row key={`w-${ai}`} negative>
                              <Table.Cell>{a}</Table.Cell>
                              <Table.Cell><Label color="red" size="mini">Incorrect</Label></Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table>
                    </Accordion.Content>
                  </div>
                );
              })}
            </Accordion>

            <Divider />
            <Button.Group>
              <Button
                primary
                icon="save"
                content={saving ? 'Saving...' : `Save Exam (${keptQuestions.length} questions)`}
                loading={saving}
                disabled={saving || keptQuestions.length === 0}
                onClick={handleSave}
              />
              <Button.Or />
              <Button
                icon="download"
                content="Download JSON"
                disabled={keptQuestions.length === 0}
                onClick={handleDownload}
              />
              <Button.Or />
              <Button
                icon="refresh"
                content="Regenerate"
                onClick={() => { setGeneratedResults(null); setRemovedIndices(new Set()); }}
              />
            </Button.Group>
          </>
        )}
      </Segment>
    </Container>
  );
};

export default CreateExam;
