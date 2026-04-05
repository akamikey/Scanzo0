import axios from 'axios';

async function checkDiagnostics() {
  try {
    const res = await axios.get('http://localhost:3000/api/diagnostics');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error('Diagnostics failed:', err.response?.data || err.message);
  }
}

checkDiagnostics();
