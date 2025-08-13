module.exports = {
    apps: [
        {
            name: "ludora-api",
            script: "src/index.js",
            instances: "max", // Use all CPU cores
            exec_mode: "cluster",
            env: {
                NODE_ENV: "development",
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3000,
            },
            // Logging
            log_file: "./logs/combined.log",
            out_file: "./logs/out.log",
            error_file: "./logs/error.log",
            log_date_format: "YYYY-MM-DD HH:mm Z",

            // Auto restart configuration
            max_restarts: 10,
            min_uptime: "10s",

            // Memory management
            max_memory_restart: "1G",

            // Monitoring
            monitoring: false,

            // Auto restart on file changes (disable in production)
            watch: false,
            ignore_watch: ["node_modules", "logs", ".git"],

            // Environment variables
            env_file: ".env",
        },
    ],
};
