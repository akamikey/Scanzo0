import axios from 'axios';
axios.get('http://localhost:3000/api/diagnostics').then(res => console.log(res.data)).catch(console.error);
