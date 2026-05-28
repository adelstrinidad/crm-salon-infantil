# Application Usage Statistics

**Project Name**: {DAR / Address Registry}
**Date Collected**: {YYYY-MM-DD}
**Data Source**: {Analytics tool, monitoring system, logs, database queries}
**Period Covered**: {Last 30/90/180 days}
**Collected By**: {Name, Role}

---

## 1. Active Users

| Metric | Value | Notes |
|--------|-------|-------|
| **Total Active Users (Monthly)** | {number} | Unique users per month |
| **Peak Concurrent Users** | {number} | Max simultaneous users |
| **User Growth Rate** | {+/- X%} | Month-over-month change |
| **User Segments** | {internal: X, external: Y, API: Z} | Breakdown by user type |

---

## 2. Feature Usage (Top 10 Most Used)

**Instructions**: List features/modules by usage frequency. Include transaction counts, API calls, page views, etc.

| Rank | Feature / Module | Monthly Usage Count | % of Total | User Segments | Performance Acceptable? |
|------|------------------|---------------------|------------|---------------|------------------------|
| 1 | Address Search API | {45,000 requests} | {35%} | Customer service, ordering | ✅ Yes / ⚠️ Slow / ❌ No |
| 2 | VRK Bulk Import | {120 batch jobs} | {0.5%} | Operations team only | ✅ Yes / ⚠️ Slow / ❌ No |
| 3 | Address Validation | {30,000 validations} | {23%} | Provisioning, ordering | ✅ Yes / ⚠️ Slow / ❌ No |
| 4 | Building Management UI | {5,000 sessions} | {4%} | Internal admin users | ✅ Yes / ⚠️ Slow / ❌ No |
| 5 | Sync Agent (EAI) | {15,000 messages} | {12%} | Automated sync | ✅ Yes / ⚠️ Slow / ❌ No |
| 6 | ... | ... | ... | ... | ... |
| 7 | ... | ... | ... | ... | ... |
| 8 | ... | ... | ... | ... | ... |
| 9 | ... | ... | ... | ... | ... |
| 10 | ... | ... | ... | ... | ... |

**Total Transactions/Actions**: {X per month}

---

## 3. Least Used Features (Candidates for Deprecation)

**Instructions**: List features with low/no usage. These may be candidates for deprecation.

| Feature / Module | Last Used | Usage Count (90 days) | Business Justification for Keeping? | Recommendation |
|------------------|-----------|----------------------|-------------------------------------|----------------|
| Legacy Report Generator | {2024-03-15} | {2 runs} | None - replaced by BI | **Deprecate** |
| Old Address Import Tool | {2023-11-20} | {0 runs} | Replaced by VRK Import | **Deprecate** |
| Manual Coordinate Update | {2024-01-10} | {15 runs} | Emergency fallback only | Keep but low priority |
| ... | ... | ... | ... | ... |

---

## 4. Critical User Workflows

**Instructions**: Describe the most important end-to-end workflows. Include frequency, users, and performance.

### Workflow 1: {Workflow Name, e.g., "Address Lookup for Customer Order"}

| Attribute | Value |
|-----------|-------|
| **Description** | {Brief description of workflow} |
| **Frequency** | {Daily / Per order / Per user session} |
| **Volume** | {X times per day/week/month} |
| **User Roles** | {Customer service, provisioning, ordering} |
| **Steps** | 1. User searches by street<br>2. System queries database<br>3. Results displayed<br>4. User selects address<br>5. Address validated |
| **Performance** | ✅ Acceptable (<500ms) / ⚠️ Slow (500ms-2s) / ❌ Critical (>2s) |
| **Pain Points** | {e.g., "Slow when >5 filters applied", "Times out for large result sets"} |

### Workflow 2: {Workflow Name}

| Attribute | Value |
|-----------|-------|
| **Description** | ... |
| **Frequency** | ... |
| **Volume** | ... |
| **User Roles** | ... |
| **Steps** | ... |
| **Performance** | ... |
| **Pain Points** | ... |

### Workflow 3: {Workflow Name}

...

---

## 5. Performance Bottlenecks Reported by Users

**Instructions**: List performance issues that impact user experience.

| Issue | Affected Feature | Frequency | Users Impacted | Business Impact | Priority |
|-------|-----------------|-----------|----------------|-----------------|----------|
| VRK bulk import takes 4-8 hours | VRK Import | Monthly | Operations team | Blocks morning operations | 🔴 High |
| Address search slow with >5 filters | Search API | Daily | Customer service | 10-15s wait time per query | 🟡 Medium |
| Coordinate update UI freezes | Building Management | Weekly | Admin users | Manual intervention required | 🟡 Medium |
| ... | ... | ... | ... | ... | ... |

**Priority Legend**: 🔴 High | 🟡 Medium | 🟢 Low

---

## 6. Integration Points (External Systems)

**Instructions**: Document usage of external integrations.

| Integration | Purpose | Frequency | Volume | Criticality | Notes |
|-------------|---------|-----------|--------|-------------|-------|
| VRK (Population Register) | Address data sync | Daily bulk + real-time | 1 bulk/day + 500 real-time/day | 🔴 Critical | Regulatory requirement |
| EAI (Enterprise Bus) | Address change notifications | Real-time | 15,000 msgs/month | 🔴 Critical | Downstream systems depend |
| VTJ (Population Info) | Address validation | Real-time | 200 calls/day | 🟡 Medium | Fallback available |
| OSOR (Building Registry) | Building data | Daily bulk | 1 bulk/day | 🟡 Medium | Reference data |
| AWS SNS | Event notifications | Real-time | 10,000 msgs/month | 🟡 Medium | Monitoring only |

**Criticality Legend**: 🔴 Critical (downtime = business impact) | 🟡 Medium (degraded service) | 🟢 Low (optional)

---

## 7. Error and Incident Frequency

**Instructions**: Document common errors and their business impact.

| Error Type | Frequency | Affected Feature | Business Impact | Root Cause (if known) |
|------------|-----------|------------------|-----------------|----------------------|
| VRK import timeout | 2-3 times/month | VRK Import | Delayed address updates | Database contention |
| Search API timeout | 5-10 times/week | Search | User must retry | Complex queries |
| Sync agent failure | 1-2 times/week | EAI Sync | Manual resync required | Network issues |
| ... | ... | ... | ... | ... |

---

## 8. User Feedback and Pain Points

**Instructions**: Summarize common user complaints, feature requests, and pain points.

### Top User Complaints (from Help Desk)

1. **Complaint**: VRK import takes too long
   - **Frequency**: Monthly complaint
   - **Impact**: Operations team waiting
   - **Requested Fix**: Faster import or async processing

2. **Complaint**: Search is slow with many filters
   - **Frequency**: Weekly complaint
   - **Impact**: Customer service productivity
   - **Requested Fix**: Performance optimization

3. **Complaint**: ...

### Top Feature Requests

1. **Request**: Bulk address update via CSV upload
   - **Requesters**: Operations team
   - **Business Value**: Save 4 hours/month
   - **Priority**: High

2. **Request**: Real-time search suggestions
   - **Requesters**: Customer service
   - **Business Value**: Faster order completion
   - **Priority**: Medium

3. **Request**: ...

---

## 9. Seasonal or Event-Driven Usage Patterns

**Instructions**: Document any usage spikes, seasonal patterns, or event-driven loads.

| Pattern | Timing | Volume Increase | Business Context |
|---------|--------|-----------------|------------------|
| End-of-month bulk updates | Last day of month | 3x normal volume | Regulatory reporting deadline |
| New construction season (spring) | April-June | 2x address creations | Building permits spike |
| Holiday closures | Dec 20-Jan 5 | 80% reduction | Most users on holiday |
| ... | ... | ... | ... |

---

## 10. Data Freshness Requirements

**Instructions**: Document how often data must be updated to meet business needs.

| Data Type | Update Frequency Required | Current Update Frequency | Gap? |
|-----------|--------------------------|-------------------------|------|
| VRK address master | Daily | Daily | ✅ Met |
| Building coordinates | Real-time | Batch (daily) | ⚠️ Gap: 24h delay |
| Postal codes | Monthly | Monthly | ✅ Met |
| ... | ... | ... | ... |

---

## 11. Business-Critical Features (Must-Have)

**Instructions**: List features that are absolutely critical to business operations. If these fail, business stops.

| Feature | Why Critical? | Acceptable Downtime | Disaster Recovery Plan? |
|---------|---------------|---------------------|------------------------|
| Address Search API | Customer orders blocked | <1 hour | ✅ Failover to backup |
| VRK Bulk Import | Regulatory compliance | <24 hours | ⚠️ Manual process (slow) |
| EAI Sync Agent | Downstream systems fail | <4 hours | ✅ Retry queue |
| ... | ... | ... | ... |

---

## 12. Deprecation Candidates

**Instructions**: Based on usage data, list features recommended for deprecation in modernized system.

| Feature | Reason for Deprecation | Migration Path | Users to Notify |
|---------|------------------------|----------------|-----------------|
| Legacy Report Generator | Replaced by BI dashboards | Migrate reports to BI | Finance team (2 users) |
| Old Import Tool | Replaced by VRK Import | None (already migrated) | N/A |
| ... | ... | ... | ... |

---

## 13. Summary and Key Insights

**Instructions**: Provide a brief summary of key insights from usage data.

**Key Insights**:
1. **High-Usage Features**: {List top 3 features by volume} - These are critical to prioritize in modernization.
2. **Performance Bottlenecks**: {List top 2 performance issues} - Address these early in modernization.
3. **Deprecation Opportunities**: {List features with <1% usage} - Consider deprecating to reduce scope.
4. **Business-Critical Workflows**: {List top 2 workflows} - Must maintain 100% functionality during migration.
5. **Integration Dependencies**: {List critical integrations} - Ensure compatibility in modernized architecture.

**Recommendations for Modernization**:
- **Focus on**: {Top 3 high-usage features}
- **Optimize**: {Top 2 performance bottlenecks}
- **Deprecate**: {Features with no usage}
- **Maintain**: {Business-critical integrations}

---

**END OF USAGE STATISTICS TEMPLATE**

**Next Steps**:
1. Fill this template with actual data from your monitoring systems
2. Save as `analysis-step-inputs/00-project-context/usage-statistics.md`
3. Provide to analysis team before Step 01 (Codebase Reconnaissance)
