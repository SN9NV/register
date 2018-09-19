import React, { Component } from 'react';

import styles from './index.css';

// doesNotExist ? this.saveNewUser() : userNameMetches ?  this.removeUser() : this.toggleUser(name)
const User = ({ name, isIn, lastChanged, matches, onClick }) => {
    if (name.length === 0) {
        return null;
    }

    console.log(lastChanged, matches);
    const removeUser = lastChanged && matches;
    const newUser = isIn === undefined;

    const classNames = [
        styles.User,
        removeUser ? styles.remove :
            newUser ? styles.new :
                isIn ? styles.in : styles.out,
    ].join(' ');

    console.log(name, classNames);

    return (
        <div key={name} className={styles.UserContainer}>
            <div className={classNames} onDoubleClick={() => onClick(name)}>
                {removeUser ? <span style={{ float: 'left' }}>Remove</span> : null}
                {newUser ? <span>New</span> : null}
                <span className={styles.name}>{name.split(' ', 1)[0]}</span>
                <span >{name.split(' ').slice(1).join(' ')}</span>
                <span>{lastChanged}</span>
            </div>
        </div>
    );
};


class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: JSON.parse(localStorage.getItem('users')) || [],
            searchName: '',
            searchNameLowerCase: '',
        };
    }

    saveUsersToLocal = users => localStorage.setItem('users', JSON.stringify(users));

    saveNewUser = userName =>
        this.setState(previousState => {
            const newName = userName.replace(/\s+/, ' ').trim();
            const now = this.now();

            const users = [
                ...previousState.users,
                {
                    name: newName,
                    nameLowerCase: newName.toLowerCase(),
                    isIn: true,
                    changes: [now],
                    lastChanged: now,
                },
            ].sort((a, b) => a.name > b.name);

            this.saveUsersToLocal(users);
            return { users };
        });

    toggleUser = userName =>
        this.setState(({ users }) => {
            users = users.map(user => {
                if (user.name === userName) {
                    user.isIn = !user.isIn;
                    user.lastchanged = this.now();
                    user.changes = [...user.changes, user.lastchanged];
                }

                return user;
            });

            this.saveUsersToLocal(users);
            return { users };
        });

    removeUser = userName =>
        this.setState(previousState => {
            let { users } = previousState;
            users = users.filter(user => user.name !== userName);

            this.saveUsersToLocal(users);
            return { users };
        });

    now() {
        const date = new Date();
        const year = date.getFullYear().toString();
        const month = date.getMonth().toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    searchChanged = event => {
        const { value } = event.target;

        this.setState({
            searchName: value,
            searchNameLowerCase: value.toLowerCase(),
        });
    }

    render() {
        const UsersDisplay = () => {
            const userList = this.state.users
                .filter(user => user.nameLowerCase.indexOf(this.state.searchNameLowerCase) !== -1)
                .map(user => {
                    const matches = user.nameLowerCase === this.state.searchNameLowerCase;
                    console.log(matches);

                    return User({
                        name: user.name,
                        isIn: user.isIn,
                        lastChanged: user.lastChanged,
                        onClick: matches ? this.removeUser : this.toggleUser,
                        matches,
                    });
                });

            if (userList.length !== 0) {
                return userList;
            }

            return User({
                name: this.state.searchName,
                matches: true,
                onClick: this.saveNewUser,
            });
        }

        return (
            <div className={styles.flexColumn} style={{ padding: '1em' }}>
                <div className={styles.flexColumn}>
                    <input value={this.state.searchName} onChange={this.searchChanged} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', userSelect: 'none', pointer: 'hand' }}>
                        {UsersDisplay()}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
