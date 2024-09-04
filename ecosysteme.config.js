export default {
  apps: [
    {
      name: 'POP',
      script: './index.js', // Remplacez par le chemin vers votre fichier serveur
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
