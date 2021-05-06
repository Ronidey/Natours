import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
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
};

export const signup = async ({ name, email, password, confirmPassword }) => {
  const res = await axios({
    method: 'post',
    url: '/api/v1/users/signup',
    data: {
      name,
      email,
      password,
      confirmPassword
    }
  });

  if (res.data.status === 'success') {
    showAlert('success', 'You are signed up successfully!');
    window.setTimeout(() => {
      location.assign('/');
    }, 1500);
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
