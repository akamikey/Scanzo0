import axios from 'axios';
axios.get('http://localhost:3000/').then(res => console.log(res.data.substring(0, 500))).catch(err => console.error(err.message));
