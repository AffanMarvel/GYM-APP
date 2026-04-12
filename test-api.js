import axios from 'axios';

const testNinjas = async () => {
    try {
        const res = await axios.get('https://api.api-ninjas.com/v1/exercises?muscle=biceps', {
            headers: { 'X-Api-Key': 'wx_182c288452dd57db7bb657ed01a78ae717b7b9bf040bc864d7779ef9' }
        });
        console.log('Ninjas Status:', res.status, res.data.length);
    } catch (e) {
        console.log('Ninjas Error:', e.response ? e.response.status : e.message);
    }
}
testNinjas();
