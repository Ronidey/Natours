import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    console.log(email, password);
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'You are logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'get',
      url: '/api/v1/users/logout'
    });

    // if (res.data.status === 'success') location.reload();
    if (res.data.status === 'success') location.assign('/');
  } catch (err) {
    showAlert('error', 'Something went wrong! please try again.');
  }
};
