import React from "react";

const FriendList = ({ friends, selectedFriends, handleFriendSelection }) => {
  return (
    <div>
      <h3>Danh sách bạn bè</h3>
      <ul>
        {friends.map((friend) => (
          <li key={friend.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedFriends.includes(friend.id)}
                onChange={() => handleFriendSelection(friend.id)}
              />
              {friend.name}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendList;
