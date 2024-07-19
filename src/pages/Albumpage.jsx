import { useParams } from "react-router-dom";
import {
  query,
  getDocs,
  orderBy,
  startAt,
  endAt,
  collection,
  Timestamp,
} from "firebase/firestore";
import { firebaseDatabase } from "../config/firebase-config";
import { useEffect } from "react";

const Albumpage = () => {
  const { id } = useParams();
  const [month, year] = id.split("_");

  useEffect(() => {
    const fetchDataForMonthAndYear = async (month, year) => {
      const startDateObject = new Date(year, month - 1);
      const endDateObject = new Date(year, month);

      const startOfCurrentMonth = Timestamp.fromDate(startDateObject);
      const endOfCurrentMonth = Timestamp.fromDate(endDateObject);

      const q = query(
        collection(firebaseDatabase, "photos"),
        orderBy("albumDate"),
        startAt(startOfCurrentMonth),
        endAt(endOfCurrentMonth)
      );

      const querySnapshot = await getDocs(q);
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });

      return docs;
    };

    fetchDataForMonthAndYear(month, year).then((data) => {
      console.log(data);
    });
  }, []);

  return <div className="text-3xl text-center text-black">Albumpage {id}</div>;
};

export default Albumpage;
