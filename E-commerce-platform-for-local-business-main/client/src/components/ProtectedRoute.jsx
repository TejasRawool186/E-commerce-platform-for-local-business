import React from 'react';
import { Route } from 'wouter';

const ProtectedRoute = ({ component: Component, path, ...props }) => {
  return <Route path={path} component={Component} />;
};

export default ProtectedRoute;
