# GrocyGo Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Test the API:
   Open [http://localhost:8081/api/health](http://localhost:8081/api/health) in your browser or use curl:
   ```bash
   curl http://localhost:8081/api/health
   ```

You should see:
```json
{"status":"ok","message":"GrocyGo backend is running!"}
```

---

You can now start building features in the `src/` folder.
