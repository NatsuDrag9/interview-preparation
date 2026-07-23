import { useState } from "react";
import "./TodoList.css";

/**
 *
 * interface TodoItem {
 * isCompleted: boolean;
 * id: number;
 * text: string;
 * }
 */

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleAddButtonClick = () => {
    setTodos((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: 0,
            text: inputValue,
            isCompleted: false,
          },
        ];
      }
      return [
        ...prev,
        {
          id: prev[prev.length - 1].id + 1,
          text: inputValue,
          isCompleted: false,
        },
      ];
    });
    // Clear the field after adding the item to the list
    setInputValue("");
  };

  const handleDeleteItem = (itemId) => {
    setTodos((prev) => {
      return prev.filter((item) => item.id !== itemId);
    });
  };

  const handleCheckboxClick = (e, itemId) => {
    console.log("Checked item: ", itemId);
    const isChecked = e.target.checked; // boolean
    setTodos((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isCompleted: isChecked } : item,
      ),
    );
  };

  const handleOnKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddButtonClick();
    }
  };

  return (
    <div className="todo-list">
      <div className="header">
        <h4>Notes</h4>
        <ul className="notes">
          <li className="note-item">
            No pre-exising list and always start afresh
          </li>
        </ul>
      </div>

      <div className="todo-list__main">
        <div className="input-container">
          <label htmlFor="input-field">Enter Todo</label>
          <input
            id="#input-field"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter todo"
            className="input-field"
            onBlur={() => setInputValue(inputValue.trim())} // Trim after focus is lost
            onKeyDown={handleOnKeyDown}
          />
          <button
            type="button"
            onClick={handleAddButtonClick}
            className="add-button"
            disabled={!inputValue}
          >
            Add
          </button>
        </div>

        <ul className="list">
          {todos.map((item, index) => {
            return (
              <li className="list-item" key={item.id}>
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={(e) => handleCheckboxClick(e, item.id)}
                />
                <span
                  className={`list-item-name ${item.isCompleted ? "completed" : ""}`}
                >
                  {item.text}
                </span>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete Item
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default TodoList;
