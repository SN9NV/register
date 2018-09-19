import React, { Component } from 'react';

import styles from './index.css';

const User = ({ identifier, isIn, lastChanged, matches, onClick }) => {
    if (identifier.length === 0) {
        return null;
    }

    const removeUser = lastChanged && matches;
    const newUser = isIn === undefined;

    const classNames = [
        styles.User,
        removeUser ? styles.remove :
            newUser ? styles.new :
                isIn ? styles.in : styles.out,
    ].join(' ');

    const [ name, extra ] = identifier.split(' | ');
    const [ firstName, ...lastName ] = name.split(' ');

    return (
        <div key={identifier} className={styles.UserCard}>
            <div className={classNames} onDoubleClick={() => onClick(identifier)}>
                <span>
                    {removeUser ? 'Remove' : extra || null}
                </span>
                <span className={styles.name}>{firstName.replace('_', ' ')}</span>
                <span >{lastName.join(' ')}</span>
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
            return {
                users,
                searchName: '',
                searchNameLowerCase: '',
            };
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
            return {
                users,
                searchName: '',
                searchNameLowerCase: '',
            };
        });

    removeUser = userName =>
        this.setState(previousState => {
            let { users } = previousState;
            users = users.filter(user => user.name !== userName);

            this.saveUsersToLocal(users);
            return {
                users,
                searchName: '',
                searchNameLowerCase: '',
            };
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

                    return User({
                        identifier: user.name,
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
                identifier: this.state.searchName,
                matches: true,
                onClick: this.saveNewUser,
            });
        }

        return (
            <div className={styles.flexColumn} style={{ padding: '1em' }}>
                <div className={styles.flexColumn} style={{ overflowY: 'auto' }}>
                    <input value={this.state.searchName} onChange={this.searchChanged} autoFocus />
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', userSelect: 'none', pointer: 'hand' }}>
                        {UsersDisplay()}
                    </div>
                </div>
                <span style={{ fontSize: 'x-small' }}>Join two firstnames with an underscore. Extra text, postfix with a vertical bar as the separator</span>
            </div>
        );
    }
}

export default App;
