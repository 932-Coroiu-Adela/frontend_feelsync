import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/scripts/api";

interface User {
  id: number;
  name: string;
  email: string;
  birthdate: string;
  user_code: string;
}

export function useUserData() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try 
    {
      const token = await AsyncStorage.getItem("sessionToken");
      if (!token) throw new Error("No token found");

      const response = await api.get("/user", {
        headers: { Authorization: token },
      });

      const user = response.data.data;
      await AsyncStorage.setItem("userData", JSON.stringify(user)); 
      setUserData(user);
    } 
    catch (err: any) 
    {
      console.log("Error fetching user data:", err);
      setError(err.response?.data.message || "An error occurred.");
    } 
    finally 
    {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      const cachedUser = await AsyncStorage.getItem("userData");

      if (cachedUser) {
        setUserData(JSON.parse(cachedUser));
        setLoading(false);
      }

      await fetchUserData(); 
    };

    loadUserData();
  }, []);

  return { userData, loading, error, fetchUserData };
}
