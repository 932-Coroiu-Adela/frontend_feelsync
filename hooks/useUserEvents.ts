import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/scripts/api";

interface Event {
  id: number;
  event_date: string;
  event_time: string;
  description: string;
}

export const useEvents = (event_date: string) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = await AsyncStorage.getItem("sessionToken");
        if (!token) {
          setError("No token found");
          return;
        }

        const response = await api.post('/events', 
          { event_date }, 
          {
            headers: {
              Authorization: token,
            },
          }
        );
        

        const data = await response.data;
        if (data.success) {
          setEvents(data.data);
        } else {
          setError(data.message || "Failed to fetch events");
        }
      } catch (err) {
        setError("Failed to fetch events");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [event_date]); // Re-fetch events whenever event_date changes

  return { events, loading, error };
};
