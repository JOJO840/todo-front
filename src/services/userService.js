import api from './http';   // or './http.js'




export const userService = {
  async getAll() {
    const res = await api.get("/api/users");
    return res.data;
  },
  // add create/update/delete later if needed
};
