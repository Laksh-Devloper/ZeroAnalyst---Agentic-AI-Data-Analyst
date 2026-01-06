"""
AgentEngine - Core AI Agent with Google Gemini
Handles conversational data analysis with tool calling and memory
"""

import os
from typing import List, Dict, Any, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv

load_dotenv()


class AgentEngine:
    """
    Agentic AI for data analysis using Google Gemini.
    Supports natural language queries, tool calling, and conversation memory.
    """
    
    def __init__(self, data_context: Optional[Dict[str, Any]] = None):
        """
        Initialize the AI agent.
        
        Args:
            data_context: Dictionary containing dataset metadata
                         (columns, types, statistics, etc.)
        """
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Initialize Gemini model
        self.model_name = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash-exp')
        self.temperature = float(os.getenv('TEMPERATURE', '0.7'))
        self.max_tokens = int(os.getenv('MAX_TOKENS', '8192'))
        
        try:
            self.llm = ChatGoogleGenerativeAI(
                model=self.model_name,
                google_api_key=self.api_key,
                temperature=self.temperature,
                max_output_tokens=self.max_tokens
            )
        except Exception as e:
            print(f"Error initializing Gemini with {self.model_name}: {e}")
            # Fallback to stable model
            self.model_name = 'gemini-1.5-flash'
            self.llm = ChatGoogleGenerativeAI(
                model=self.model_name,
                google_api_key=self.api_key,
                temperature=self.temperature
            )
        
        # Data context
        self.data_context = data_context or {}
        
        # Conversation history (simple list of messages)
        self.conversation_history: List[Dict[str, str]] = []
        
        # System prompt
        self.system_prompt = self._create_system_prompt()
        
    def _create_system_prompt(self) -> str:
        """Create the system prompt with data context."""
        base_prompt = """You are ZeroAnalyst, an expert AI data analyst assistant.

Your capabilities:
- Analyze datasets and answer questions in natural language
- Generate visualizations (charts, graphs, plots)
- Perform statistical analysis and calculations
- Detect patterns, trends, and anomalies
- Make predictions and forecasts
- Compare data segments and time periods

Guidelines:
1. Be conversational and helpful
2. Explain your reasoning step-by-step for complex analyses
3. Suggest relevant follow-up questions
4. Proactively point out interesting insights
5. Use tools to perform actual analysis (don't make up data)
6. Format responses clearly with markdown
7. When showing numbers, use appropriate precision

Current conversation context:
"""
        
        # Add data context if available
        if self.data_context:
            context_info = "\n**Dataset Information:**\n"
            if 'filename' in self.data_context:
                context_info += f"- File: {self.data_context['filename']}\n"
            if 'rows' in self.data_context:
                context_info += f"- Rows: {self.data_context['rows']:,}\n"
            if 'columns' in self.data_context:
                context_info += f"- Columns: {len(self.data_context['columns'])}\n"
            if 'column_types' in self.data_context:
                numeric_cols = [k for k, v in self.data_context['column_types'].items() if v == 'numeric']
                categorical_cols = [k for k, v in self.data_context['column_types'].items() if v == 'categorical']
                context_info += f"- Numeric columns: {', '.join(numeric_cols[:5])}"
                if len(numeric_cols) > 5:
                    context_info += f" (and {len(numeric_cols) - 5} more)"
                context_info += f"\n- Categorical columns: {', '.join(categorical_cols[:5])}"
                if len(categorical_cols) > 5:
                    context_info += f" (and {len(categorical_cols) - 5} more)"
            
            base_prompt += context_info
        else:
            base_prompt += "\n*No dataset loaded yet. Ask the user to upload data.*"
        
        return base_prompt
    
    def update_data_context(self, data_context: Dict[str, Any]):
        """Update the data context when new data is uploaded."""
        self.data_context = data_context
        self.system_prompt = self._create_system_prompt()
    
    def chat(self, message: str, tools: Optional[List] = None) -> str:
        """
        Send a message to the agent and get a response.
        
        Args:
            message: User's message
            tools: Optional list of LangChain tools (not used in simplified version)
            
        Returns:
            Agent's response as a string
        """
        try:
            # Build message history
            messages = [HumanMessage(content=self.system_prompt)]
            
            # Add conversation history
            for msg in self.conversation_history:
                if msg['role'] == 'user':
                    messages.append(HumanMessage(content=msg['content']))
                else:
                    messages.append(AIMessage(content=msg['content']))
            
            # Add current message
            messages.append(HumanMessage(content=message))
            
            # Get response from LLM
            response = self.llm.invoke(messages)
            
            # Save to history
            self.conversation_history.append({
                'role': 'user',
                'content': message
            })
            self.conversation_history.append({
                'role': 'assistant',
                'content': response.content
            })
            
            return response.content
            
        except Exception as e:
            return f"❌ Error: {str(e)}\n\nPlease try rephrasing your question or check if the data is loaded correctly."
    
    def clear_memory(self):
        """Clear conversation history."""
        self.conversation_history = []
    
    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Get the conversation history as a list of messages."""
        return self.conversation_history
    
    def generate_suggested_questions(self) -> List[str]:
        """Generate suggested questions based on the current data context."""
        if not self.data_context:
            return [
                "Upload a dataset to get started",
                "What kind of analysis can you do?",
                "How do I use ZeroAnalyst?"
            ]
        
        suggestions = []
        
        # Add basic questions
        suggestions.append("Give me an overview of this dataset")
        suggestions.append("What are the key insights from this data?")
        
        # Add column-specific questions
        if 'column_types' in self.data_context:
            numeric_cols = [k for k, v in self.data_context['column_types'].items() if v == 'numeric']
            categorical_cols = [k for k, v in self.data_context['column_types'].items() if v == 'categorical']
            
            if numeric_cols:
                suggestions.append(f"Show me the trend for {numeric_cols[0]}")
                if len(numeric_cols) > 1:
                    suggestions.append(f"What's the correlation between {numeric_cols[0]} and {numeric_cols[1]}?")
            
            if categorical_cols:
                suggestions.append(f"Break down the data by {categorical_cols[0]}")
        
        # Add advanced questions
        suggestions.append("Are there any anomalies or outliers?")
        suggestions.append("What patterns can you find in this data?")
        
        return suggestions[:6]  # Return top 6 suggestions


if __name__ == "__main__":
    # Test the agent
    print("🤖 Testing ZeroAnalyst Agent Engine...")
    
    # Create sample data context
    sample_context = {
        'filename': 'sales.csv',
        'rows': 10000,
        'columns': ['date', 'product', 'revenue', 'quantity', 'region'],
        'column_types': {
            'date': 'datetime',
            'product': 'categorical',
            'revenue': 'numeric',
            'quantity': 'numeric',
            'region': 'categorical'
        }
    }
    
    # Initialize agent
    agent = AgentEngine(data_context=sample_context)
    
    # Test conversation
    print("\n" + "="*50)
    response = agent.chat("Hello! What can you tell me about this dataset?")
    print(f"Agent: {response}")
    
    print("\n" + "="*50)
    print("Suggested questions:")
    for i, q in enumerate(agent.generate_suggested_questions(), 1):
        print(f"{i}. {q}")
