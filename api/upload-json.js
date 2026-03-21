import { Redis } from '@upstash/redis'; // Correct import for the latest Upstash Redis package

// Limit the body size for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Limit request size to 1MB
    },
  },
};

// Initialize Upstash Redis client
const redis = new Redis({
  url: "https://magical-dinosaur-77728.upstash.io", // Your Upstash Redis URL
  token: "ggAAAAAAAS-gAAIgcDKkzSxmCXPqURf-bVHsxC_CjWXH06U6TrODe2N8NtCrVQ", // Your Upstash Redis Token
});

export default async function handler(req, res) {
  if (req.method === 'POST' && req.body.type=="upload" ) {
    // Handle file upload
    const { filename, content, exam } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ error: 'Invalid request payload.' });
    }

    try {
      // Store the JSON data in Upstash Redis using the filename as the key
      await redis.set(`${filename}`, JSON.stringify(content));
      return res.status(200).json({ message: 'File uploaded successfully.' });

    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Failed to save the file.' });
    }
  } else if (req.method === 'POST' && req.body.type=="download") {
    // Handle file download
    const { filename } = req.body; // Get filename from the request body

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required.' });
    }

    try {
      // Fetch the file data from Redis
      const fileData = await redis.get(filename);

      if (!fileData) {
        return res.status(404).json({ error: 'File not found.' });
      }

      // Return the file content as JSON

      console.log(fileData)
      //const parsedData = fileData;//JSON.parse(fileData);
      const parsedData = typeof fileData === 'string' ? JSON.parse(fileData) : fileData;

      return res.status(200).json({ filename, content: parsedData });
    } catch (error) {
      console.error('Error retrieving file:', error);
      return res.status(500).json({ error: 'Failed to retrieve the file.' });
    }
  }
  else if (req.method === 'POST' && req.body.type=="json") {
    // Handle file download
    const { filename } = req.body; // Get filename from the request body

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required.' });
    }

    try {
      // Fetch the file data from Redis
      const fileData = await redis.get(filename);

      if (!fileData) {
        return res.status(404).json({ error: 'File not found.' });
      }

      // Return as JSON

      //const parsedData = fileData;//JSON.parse(fileData);
      const parsedData = typeof fileData === 'string' ? JSON.parse(fileData) : fileData;

      return res.status(200).json(parsedData);

    } catch (error) {
      console.error('Error retrieving file:', error);
      return res.status(500).json({ error: 'Failed to retrieve the file.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}