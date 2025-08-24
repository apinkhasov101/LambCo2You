# LambCo2You

## Project Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [pnpm](https://pnpm.io/) (recommended for dependency management)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/site-selector-platform.git
   cd site-selector-platform
   ```

2. **Install dependencies:**
   ```sh
   pnpm install
   ```
   > If you don’t have pnpm, install it globally:  
   > `npm install -g pnpm`

3. **Run the development server:**
   ```sh
   pnpm dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

4. **Build for production:**
   ```sh
   pnpm build
   pnpm start
   ```

---

## Environment Variables & .env.local

- You must manually create a `.env.local` file in your project root to store API keys and other secrets.
- This file is **not** tracked by git (see `.gitignore`), so your sensitive information remains private.
- Example contents for `.env.local`:
  ```
  ACETIC_API_KEY=your_key_here
  CHEMICAL_API_KEY=your_key_here
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
  ```

## API Integration

### 1. Acetic Acid Production Facilities API

- **Purpose:** Fetch data about acetic acid production sites.
- **How to use:**
  - Obtain API credentials from the provider.
  - Add your API key to `.env.local`:
    ```
    ACETIC_API_KEY=your_key_here
    ```
  - In your code, use `process.env.ACETIC_API_KEY` to authenticate requests.
  - Example fetch (replace with actual endpoint):
    ```js
    const res = await fetch('https://api.aceticfacilities.com/v1/sites', {
      headers: { 'Authorization': `Bearer ${process.env.ACETIC_API_KEY}` }
    });
    ```

### 2. Chemical Production Facilities API

- **Purpose:** Retrieve chemical production facility data.
- **How to use:**
  - Get API credentials from the provider.
  - Add to `.env.local`:
    ```
    CHEMICAL_API_KEY=your_key_here
    ```
  - Example usage:
    ```js
    const res = await fetch('https://api.chemicalfacilities.com/v1/list', {
      headers: { 'Authorization': `Bearer ${process.env.CHEMICAL_API_KEY}` }
    });
    ```

### 3. Google Maps API

- **Purpose:** Display maps and geolocation data.
- **How to use:**
  - Create a Google Cloud project and enable the Maps JavaScript API.
  - Get your API key and add to `.env.local`:
    ```
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
    ```
  - In your React components, use the key for map rendering (e.g., with `@react-google-maps/api`):
    ```js
    <GoogleMap
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      // ...other props
    />
    ```

---

## Environment Variables

Create a `.env.local` file in the project root and add your API keys:

```
ACETIC_API_KEY=your_key_here
CHEMICAL_API_KEY=your_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

---

## Additional Notes

- For API documentation, refer to each provider’s official docs.
- Make sure not to commit your `.env.local` file to version control.
- If you encounter dependency issues, ensure you’re using `pnpm` and a compatible Node.js version.

