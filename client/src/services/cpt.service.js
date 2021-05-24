import axios from "axios";

import authHeader from "./auth-header";

const API_URL = `${process.env.REACT_APP_API_URL}api/v1` || "http://localhost:5000/api/v1";

class CPTCodes {
  getLabCompnayList() {
    return axios
      .get(`${API_URL}/cpt`, { headers: authHeader() })
      .then((res) => res.data);
  }

  search(data) {
    return axios.post(`${API_URL}/cpt/search`, data, { headers: authHeader() });
  }

  updateClientCpt(id, userId, data) {
    return axios.post(`${API_URL}/cpt/${id}/${userId}`, data, {
      headers: authHeader(),
    });
  }
}

export default new CPTCodes();
