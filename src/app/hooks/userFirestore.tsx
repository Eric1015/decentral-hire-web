import { useCallback, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@public/firebase.config';
import {
  getFirestore,
  collection,
  query,
  limit,
  doc,
  getDoc,
  getDocs,
  startAfter,
  QueryConstraint,
} from 'firebase/firestore';

export enum SupportedCollectionName {
  JOB_POSTINGS = 'JobPostings',
  JOB_APPLICATIONS = 'JobApplications',
}

const useFirestore = () => {
  const [app, setApp] = useState<any>(null);

  const queryDocs = useCallback(
    async (
      collectionName: SupportedCollectionName,
      lastDocId?: string,
      ...whereClauses: QueryConstraint[]
    ) => {
      const db = getFirestore(app);
      const collectionRef = await collection(db, collectionName);
      let lastVisible = null;
      if (lastDocId) {
        const lastDocRef = doc(db, collectionName, lastDocId);
        lastVisible = await getDoc(lastDocRef);
      }
      let q;
      if (lastVisible) {
        q = await query(
          collectionRef,
          ...whereClauses,
          limit(20),
          startAfter(lastVisible)
        );
      } else {
        q = await query(collectionRef, ...whereClauses, limit(20));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data());
    },
    [app]
  );

  useEffect(() => {
    if (!app) {
      setApp(initializeApp(firebaseConfig));
    }
  }, [app]);

  return { queryDocs };
};

export default useFirestore;
