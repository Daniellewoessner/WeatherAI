import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'; // 

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3001;
const apiKey = process.env.OPENAI_API_KEY?.trim();

if (!apiKey) {
  console.error('API key is missing');
  process.exit(1);
}

const app = express();
app.use(express.json());

app.use(cors({
  origin: ['https://weatherai-ucpm.onrender.com', 'http://localhost:3001'], 
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const model = new ChatOpenAI({
  openAIApiKey: apiKey,
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

const stringParser = new StringOutputParser();


const promptTemplate = new PromptTemplate({
  template: "Give me a sports-announcer style weather forecast for {city}. Include temperature, conditions, and precipitation chance for the next 5 days.",
  inputVariables: ["city"]
})

const promptTemplate2 = new PromptTemplate({
  template: "Pretend you are a cheerful cartoon character giving the five day forecast",
  inputVariables: ["city"]
})

const promptTemplate3 = new PromptTemplate({
  template: "Pretend you are a superhero character giving the five day forecast before going to save the city from evil!",
  inputVariables: ["city"]
});

app.post('/forecast', async (req: Request, res: Response) => {
  try {
    const { location, style = 'sportscaster'} = req.body;
    
    if (!location?.city) {
      return res.status(400).json({
        error: 'Please provide a city in the location object'
      });
    }

    console.log('Generating forecast for:', location.city, 'in style:', style);
    const promptTemplates: { [key: string]: PromptTemplate } = {
      sportscaster: promptTemplate,
      cartoon: promptTemplate2,
      superhero: promptTemplate3
    };
    const template = promptTemplates[style] || promptTemplate;
    const formattedPrompt = await template.format({
      city: location.city
    });

    const response = await model.invoke(formattedPrompt);
    const forecastText = await stringParser.parse(response.content.toString());

    return res.json({
      success: true,
      result: {
        location: {
          city: location.city
        },
        forecast: forecastText
      }
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Internal Server Error',
      message: errorMessage,
      details: (error as Error).toString()
    });
  }
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use(express.static(path.join(__dirname, '..'))); 


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html')); 
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;