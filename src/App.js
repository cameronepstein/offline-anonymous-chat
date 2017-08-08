import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as RxDB from 'rxdb';
import { QueryChangeDetector } from 'rxdb';
import { schema } from './Schema';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import * as moment from 'moment';

// Query change detector is disabled by default
QueryChangeDetector.enable();
QueryChangeDetector.enableDebugging();

// Configure adapters to use IndexDB as the storage engine and enable syncing to a remote DB over HTTP
RxDB.plugin(require('pouchdb-adapter-idb'));
RxDB.plugin(require('pouchdb-replication'));
RxDB.plugin(require('pouchdb-adapter-http'));

// Declare the URL of the remote DB and the name of the local one
const syncURL = 'http://localhost:5984/';
const dbName = 'chatdb';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      newMessage: '', messages: []
    };
    this.subs = [];
    this.addMessage = this.addMessage.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
  }
  // creates a DB by passing a name, adapter and password to RxDB
  async createDatabase() {
    const db = await RxDB.create(
      {name: dbName, adapter: 'idb', password: '12345678'}
    );
    // enables the leader-election algorithm which makes sure that always one tab is managing remote data access.
    db.waitForLeadership().then(() => {
      document.title = '♛ ' + document.title;
    });

    const messagesCollection = await db.collection({
      name: 'messages',
      schema: schema
    });
    messagesCollection.sync({remote: syncURL + dbName + '/'});
    return db;
  }


  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
