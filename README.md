# Item Auto-Categorizer

An AI-powered tool that uses Gemini and Google Search to automatically categorize product lists from Excel files with high precision and grounding.

## Features

- **Excel Parsing:** Upload your `.xlsx` files and select the sheet and column to categorize.
- **AI Categorization:** Uses Google's Gemini 3 Flash model to accurately categorize and subcategorize items.
- **Google Search Grounding:** Enhances categorization accuracy by grounding the AI's knowledge with real-time Google Search results.
- **Batch Processing:** Processes items in batches to optimize performance and respect API limits.
- **Custom API Key:** Allows users to manually enter their own Gemini API key for processing.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/item-auto-categorizer.git
   cd item-auto-categorizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (optional):
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   Alternatively, you can enter your API key directly in the app's Settings menu.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Usage

1. **Upload File:** Drag and drop an Excel file or click to browse.
2. **Configure:** Select the sheet, column, and starting row containing the items you want to categorize.
3. **Categorize:** Click "Start Categorization" and watch as the AI processes your items.
4. **Review:** Switch to the "Categories" tab to view a summary of the categorized items.

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Lucide React (Icons)
- SheetJS (Excel parsing)
- @google/genai (Gemini API)
- Vite

## License

This project is licensed under the MIT License.
