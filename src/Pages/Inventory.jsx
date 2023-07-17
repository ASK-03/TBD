import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../services/firebase";
import {
  getDocs,
  collection,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Inventory() {
  const [inventoryData, setInventoryData] = useState([]);
  const { user } = UserAuth();
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchInventoryData = async () => {
      const ref = collection(db, `tbd-database/${user.uid}/inventory`);
      const snapshot = await getDocs(ref);
      const inventoryData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInventoryData(inventoryData);
    };

    fetchInventoryData();
  }, [user.uid]);

  const handleEdit = (itemId) => {
    const selectedItem = inventoryData.find((item) => item.id === itemId);
    setSelectedItem(selectedItem);
  };

  const handleDelete = async (itemId) => {
    const itemRef = doc(db, `tbd-database/${user.uid}/inventory`, itemId);
    await deleteDoc(itemRef);
    setInventoryData((prevData) =>
      prevData.filter((item) => item.id !== itemId)
    );
  };

  const updateItem = async (updatedItem) => {

    const itemRef = doc(
      db,
      `tbd-database/${user.uid}/inventory/${updatedItem.id}`,
    );
    await updateDoc(itemRef, {...updatedItem});

    setInventoryData((prevData) =>
      prevData.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );

    setSelectedItem(null);
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Model No.</th>
            <th>Brand Name</th>
            <th>GstApplicable</th>
            <th>Quantity</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventoryData.map((item) => (
            <React.Fragment key={item.id}>
              {selectedItem && selectedItem.id === item.id ? (
                <EditForm
                  selectedItem={selectedItem}
                  cancelEdit={() => setSelectedItem(null)}
                  updateItem={updateItem}
                />
              ) : (
                <tr>
                  <td>{item.modelNumber}</td>
                  <td>{item.brandName}</td>
                  <td>{item.gstApplicable}</td>
                  <td>{item.quantity}</td>
                  <td>{item.amount}</td>
                  <td>
                    <button onClick={() => handleEdit(item.id)}>Edit</button>
                    <button onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EditForm({ selectedItem, cancelEdit, updateItem }) {
  const [modelNumber, setmodelNumber] = useState(selectedItem.modelNumber);
  const [brandName, setBrandName] = useState(selectedItem.brandName);
  const [gstApplicable, setGstApplicable] = useState(
    selectedItem.gstApplicable
  );
  const [quantity, setQuantity] = useState(selectedItem.quantity);

  const [amount, setAmount] = useState(selectedItem.amount);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Create an updated item object
    const updatedItem = {
      id: selectedItem.modelNumber,
      modelNumber,
      brandName,
      gstApplicable,
      quantity,
      amount,
    };

    // Call the updateItem function passed from the parent component
    updateItem(updatedItem);

    // Clear the form fields and reset selectedItem state
    setmodelNumber("");
    setBrandName("");
    setGstApplicable("");
    setQuantity("");
    setAmount("");
    cancelEdit();
  };
  return (
    <tr>
      <td>
        <input
          type="text"
          value={modelNumber}
          onChange={(e) => setmodelNumber(e.target.value)}
        />
      </td>
      <td>
        <input
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
        />
      </td>
      <td>
        <input
          type="text"
          value={gstApplicable}
          onChange={(e) => setGstApplicable(e.target.value)}
        />
      </td>
      <td>
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </td>
      <td>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </td>
      <td>
        <button onClick={handleSubmit}>Save</button>
        <button onClick={cancelEdit}>Cancel</button>
      </td>
    </tr>
  );
}
