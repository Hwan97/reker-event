import client from './client';

// 로그인
export const login = ({ username, password }) =>
  client.post('/api/auth/login', { username, password });

// 회원가입
export const register = ({ username, password, phone, address }) =>
  client.post('/api/auth/register', { username, password, phone, address });

// 사전등록
export const eventregister = ({ name, birthday, phone, username }) =>
  client.post('/api/event/eventregister', { name, birthday, phone, username});



// 로그인 상태 확인
export const check = () => client.get('/api/auth/check');

// 로그아웃
export const logout = () => client.post('/api/auth/logout');
