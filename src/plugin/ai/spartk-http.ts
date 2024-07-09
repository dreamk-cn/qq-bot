import axios from 'axios';

const { API_SECRET = '', API_KEY = '' } = process.env;

export interface SparkMessage {
  role: 'system' | 'user' | 'assistant' | string;
  content: string;
}

export interface SparkRequestConfig {
  model?: 'general' | 'generalv2' | 'generalv3' | 'generalv3.5' | '4.0Ultra'
  messages: SparkMessage[];
  temperature?: number; // 默认0.5
  maxTokens?: number; // 默认4096
}

export interface SparkResonse {
  code: 0 | number;
  message: string;
  sid: string;
  choices: { message: { content: string }, index: number }[];
  usage: {
    prompt_tokens: number,
    completion_tokens: number,
    total_tokens: number,
  }
}

async function querySparkApi(config: SparkRequestConfig): Promise<SparkResonse> {
  const { model = 'general', messages, temperature = 0.5, maxTokens = 2 } = config;

  // 请求URL
  const apiUrl = 'https://spark-api-open.xf-yun.com/v1/chat/completions';

  // 请求头
  const headers = {
    'Authorization': `Bearer ${API_KEY}:${API_SECRET}`,
    'Content-Type': 'application/json',
  };

  // 请求体
  const requestBody = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  try {
    // 发起POST请求
    const { status, data } = await axios.post<SparkResonse>(apiUrl, requestBody, { headers });

    // 检查响应状态
    if (status !== 200) {
      throw new Error(`Spark API request failed with status ${status}`);
    }

    return data;
  } catch (error) {
    console.error('Error querying Spark API:', error);
    throw error;
  }
}

export default querySparkApi;