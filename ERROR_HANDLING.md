# Error Handling in Tonomy ID

This document outlines the way we handle exceptions in Tonomy ID by shown an example under different conditions. Each example is demonstrated with a "do" and "don't" example to show the preferred conventions and common pitfalls to avoid.

## Table of Contents

- [Use `captureError()` for Silently Reporting Errors Users Shouldn’t Deal With](#use-captureerror-for-silently-reporting-errors-users-shouldnt-deal-with)
- [Use the Error Store to Show Unexpected Exceptions to the User](#use-the-error-store-to-show-unexpected-exceptions-to-the-user)
- [Handle Network Errors Gracefully](#handle-network-errors-gracefully)
- [Try/Catch All Non-Trivial Code](#trycatch-all-non-trivial-code)
- [Always Try/Catch Async Code](#always-trycatch-async-code)
- [Give Feedback to Users When They Can Fix the Issue](#give-feedback-to-users-when-they-can-fix-the-issue)
- [Use Debug for Logging Important Information](#use-debug-for-logging-important-information)

## Use `captureError()` for Silently Reporting Errors Users Shouldn’t Deal With

When polling a service or continuously trying to fetch data that will likely succeed later, ensure the operation keeps running without notifying the user unnecessarily.

### Example

```javascript
import { captureError } from '../utils/sentry';
import { useEffect, useState } from 'react';

const MyPriceComponent = () => {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    let isPolling = true;

    async function pollPrice() {
      while (isPolling) {
        try {
          const response = await fetch('https://api.example.com/price');
          const data = await response.json();
          setPrice(data.price);
          await sleep(5000); // Poll every 5 seconds
        } catch (error) {
          captureError('MyComponent() pollPrice()', error); // Log silently
        }
      }
    }

    pollPrice();

    return () => {
      isPolling = false; // Stop polling when component unmounts
    };
  }, []);

  return <div>Current Price: {price ? `$${price}` : 'Loading...'}</div>;
};
```

## Use the Error Store to Show Unexpected Exceptions to the User

When user errors occur, such as password-based private key generation failing, inform the user and log the error.

### Example

```javascript
import useErrorStore from './src/store/errorStore';

const MyComponent = () => {
  const { setError } = useErrorStore();

  function generatePrivateKey() {
    try {
      // Simulate private key generation failure
      throw new Error('Failed to generate private key from password');
    } catch (error) {
      setError({ error, expected: false }); // Log and inform the user
    }
  }

  return <button onClick={generatePrivateKey}>Generate Key</button>;
};
```

## Handle Network Errors Gracefully

When a network request fails due to poor internet, inform the user to retry.

### Example

```javascript
import { isNetworkError, NETWORK_ERROR_RESPONSE } from '../utils/errors';

const MyComponent = () => {
  const [errorMessage, setErrorMessage] = useState('');

  async function saveUsername(username) {
    try {
      await user.saveUsername(username); // Simulate API call
    } catch (error) {
      if (isNetworkError(error)) {
        setErrorMessage(NETWORK_ERROR_RESPONSE); // Inform the user
      } else {
        console.error('Unexpected error:', error);
      }
    }
  }

  return (
    <div>
      <button onClick={() => saveUsername('newUsername')}>Save Username</button>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};
```

## Try/Catch All Non-Trivial Code

All complex logic, such as external library calls or operations that may throw, should be wrapped in a try/catch block.

### Example

```jsx
const MyComponent = () => {
  const { setError } = useErrorStore();

  function processData(data) {
    try {
      user.storeData(data); // May throw an error
    } catch (error) {
      setError({ error, expected: false }); // Log unexpected async errors
    }
  }

  return <button onClick={() => processData(null)}>Process Data</button>;
};
```

## Always Try/Catch Async Code

Always handle async code to avoid unhandled promise rejections, and use `setError()` for consistency.

### Example

```jsx
import useErrorStore from './src/store/errorStore';

const MyComponent = () => {
  const { setError } = useErrorStore();

  async function fetchData() {
    try {
      const data = await fetch('https://api.example.com/data');
      // Do something with the data
    } catch (error) {
      setError({ error, expected: false }); // Log unexpected async errors
    }
  }

  return <button onClick={fetchData}>Fetch Data</button>;
};
```

## Give Feedback to Users When They Can Fix the Issue

Provide clear and actionable feedback to users for errors they can resolve, such as filling out a form with required fields.

### Example

```jsx
import React, { useState } from 'react';

const MyComponent = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { setError } = useErrorStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      if (!email) {
        setErrorMessage('Email is required'); // Show feedback under the field
        return;
      }
      setErrorMessage(''); // Clear error on success
    } catch (error) {
      setError({ error, expected: false });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Inline feedback */}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Use Debug for Logging Important Information

Use the `Debug` utility for logging application events. Do not log sensitive information such as personal information or private/secret keys.

### Example

```jsx
import Debug from 'debug';

const debug = Debug('tonomy-id:MyComponent');

const MyComponent = () => {
  debug('MyComponent() rendered');

  return <div>Component Loaded</div>;
};
```

### Don't

```jsx
const MyComponent = () => {
  console.log('Rendering MyComponent with private key:', privateKey); // Don't log sensitive information

  return <div>Component Loaded</div>;
};
```
