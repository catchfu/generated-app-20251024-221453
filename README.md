# Promptle

A daily AI prompt guessing game where you compete to see how well you can guess the prompt behind a unique AI-generated image.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/catchfu/promptle)

## About The Project

Promptle is an engaging, visually stunning AI-powered web game where players test their creative intuition by guessing the text prompt used to generate a unique, AI-created image each day. The core experience revolves around a daily challenge, where a new image is presented. Players submit their best guess for the prompt, and a sophisticated scoring algorithm evaluates their submission based on keyword matching and semantic similarity to the original prompt.

The result is displayed in a beautiful, shareable format, revealing the player's score, which words they matched, and the original prompt. The application is designed with an 'Illustrative' and whimsical art style to create a delightful and memorable user experience.

## Key Features

-   **Daily Challenge**: A new, unique AI-generated image to guess every day.
-   **Creative Gameplay**: Test your intuition by guessing the text prompt used for image generation.
-   **Advanced Scoring**: A smart algorithm scores your guess based on keyword matching and semantic similarity.
-   **Shareable Results**: Beautifully formatted result cards to share your score with friends.
-   **Stunning Visuals**: A whimsical, illustrative art style with delightful micro-interactions.
-   **Fully Responsive**: Flawless experience across all device sizes, from mobile to desktop.

## Technology Stack

-   **Frontend**:
    -   [React](https://reactjs.org/)
    -   [Vite](https://vitejs.dev/)
    -   [Tailwind CSS](https://tailwindcss.com/)
    -   [shadcn/ui](https://ui.shadcn.com/)
    -   [Framer Motion](https://www.framer.com/motion/) for animations
    -   [Zustand](https://zustand-demo.pmnd.rs/) for state management
-   **Backend**:
    -   [Cloudflare Workers](https://workers.cloudflare.com/)
    -   [Hono](https://hono.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/)
-   [Git](https://git-scm.com/)
-   A Cloudflare account

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/promptle.git
    cd promptle
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Configure Cloudflare Wrangler:**
    Log in to your Cloudflare account:
    ```sh
    bunx wrangler login
    ```

4.  **Set up environment variables:**
    Create a `.dev.vars` file in the root of the project for local development. You will need to configure your Cloudflare AI Gateway URL and an API key.
    ```ini
    # .dev.vars
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your-cloudflare-api-key"
    ```
    You can find these values in your Cloudflare dashboard.

## Development

To run the application in development mode, which includes hot-reloading for the frontend and a local server for the worker, use the following command:

```sh
bun dev
```

This will start the Vite development server for the React application and a local instance of the Cloudflare Worker. The application will be available at `http://localhost:3000` by default.

## Deployment

This project is designed for seamless deployment to the Cloudflare ecosystem. The `deploy` script will build the application and deploy the frontend to Cloudflare Pages and the backend to Cloudflare Workers.

1.  **Build and Deploy:**
    Run the deployment script from the root of the project:
    ```sh
    bun run deploy
    ```
    Wrangler will guide you through the deployment process.

2.  **One-Click Deploy:**
    You can also deploy this project to Cloudflare with a single click.

    [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/catchfu/promptle)

## Project Structure

-   `src/`: Contains all the frontend code for the React application.
    -   `components/`: Reusable UI components.
    -   `pages/`: Main application pages/views.
    -   `lib/`: Utility functions and the Zustand store.
-   `worker/`: Contains all the backend code for the Cloudflare Worker.
    -   `index.ts`: The entry point for the worker.
    -   `userRoutes.ts`: API route definitions.
    -   `game.ts`: Core game logic and data.
-   `public/`: Static assets.
-   `wrangler.jsonc`: Configuration file for Cloudflare Workers.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.