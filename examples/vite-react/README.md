# Vite + React Example

A React application built with Vite to demonstrate hot-reload and console capture.

## Setup

### 1. Copy to apps directory

```bash
cp -r examples/vite-react apps/my-react-app
cd apps/my-react-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start dev server

```bash
npm run dev
```

The app will start on port 9200.

### 4. Access your app

Open: `http://my-react-app.localhost:9100`

## Features

- **Hot Module Replacement (HMR)**: Edit React components and see instant updates
- **Console Capture**: All console logs are captured and displayed
- **Counter Example**: State management demo
- **Error Handling**: Test different log levels

## Testing HMR

1. Open the app in the iframe viewer
2. Edit `src/App.jsx`:
   - Change the title
   - Modify the gradient colors
   - Update button text
3. Save the file
4. See instant updates without full reload!

## Testing Console Capture

1. Click the console buttons
2. Increment the counter
3. Check the console panel to see all logs

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Customization

Feel free to:
- Add more React components
- Install additional packages
- Customize styling
- Add routing with React Router
- Integrate state management (Redux, Zustand, etc.)
