import Layout from "../components/Layout";
import {useEffect,useState} from "react";
import axios from "axios";
import API from "../api/axios";

export default function PendingRequests(){

  const [users,setUsers] = useState([]);

  const fetchPending = async ()=>{

    const token = localStorage.getItem("token");

    const res = await API.get(
      "/auth/pending-users",
      {headers:{Authorization:`Bearer ${token}`}}
    );

    setUsers(res.data);
  };

  useEffect(()=>{
    fetchPending();
  },[]);


  const approve = async(id)=>{

    const token = localStorage.getItem("token");

    await API.put(`/auth/approve-user/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });

    fetchPending();

  };

 const reject = async (id) => {
  const token = localStorage.getItem("token");

  await API.put(
    `/auth/reject-user/${id}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

  fetchPending();
};


  return(

    <Layout>

      <div className="p-6">

        <h1 className="text-2xl font-bold mb-6">
          Pending Requests
        </h1>

        <table className="w-full border">

          <thead className="bg-gray-100">

            <tr>
              <th className="border p-2">Username</th>
              <th className="border p-2">Action</th>
            </tr>

          </thead>

          <tbody>

            {users.map(user=>(
              <tr key={user._id}>

                <td className="border p-2">{user.username}</td>

                <td className="border p-2 space-x-2">

                  <button
                    onClick={()=>approve(user._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={()=>reject(user._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </Layout>

  );

}