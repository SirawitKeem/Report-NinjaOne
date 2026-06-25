import React from 'react';
import { SecuritySummary } from '../securityConfig';

export default async function SecuritySummaryPending() {
  return <SecuritySummary statusType="Pending" />;
}