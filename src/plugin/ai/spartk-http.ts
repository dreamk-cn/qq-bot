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

async function querySparkApi(config: SparkRequestConfig): Promise<string> {
  const { model = 'general', messages, temperature = 0.5, maxTokens = 4096 } = config;

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
    const response = await axios.post(apiUrl, requestBody, { headers });

    // 检查响应状态
    if (response.status !== 200) {
      throw new Error(`Spark API request failed with status ${response.status}`);
    }

    // 提取并返回AI的回答内容
    const aiResponse = response.data.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("Failed to retrieve AI's response from the API.");
    }
    return aiResponse;
  } catch (error) {
    console.error('Error querying Spark API:', error);
    throw error;
  }
}

export default querySparkApi;