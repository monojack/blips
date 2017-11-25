import React from 'react'

const FakeTodosButton = ({ onClick }) => {
  return (
    <button
      type="button"
      name="button"
      className="action-button shadow animate blue"
      onClick={onClick}
    >
      <span>
        Add fake todos from <b>GraphQL API</b>
      </span>
      <small>
        <i>(fake.graphql.guru)</i>
      </small>
    </button>
  )
}

export default FakeTodosButton
