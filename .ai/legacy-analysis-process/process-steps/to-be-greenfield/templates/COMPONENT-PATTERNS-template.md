# Component Patterns

> Template for Step 04: UI Design Guidelines
> Document reusable UI component patterns

## 1. Navigation

### Main Navigation (Navbar)

```html
<div class="navbar bg-base-100 shadow-lg">
  <div class="navbar-start">
    <a class="btn btn-ghost text-xl">[APP_NAME]</a>
  </div>
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      <li><a>Home</a></li>
      <li><a>Search</a></li>
      <li><a>Reports</a></li>
    </ul>
  </div>
  <div class="navbar-end">
    <div class="dropdown dropdown-end">
      <div tabindex="0" class="btn btn-ghost btn-circle avatar">
        <div class="w-10 rounded-full">
          <img src="avatar.png" alt="User" />
        </div>
      </div>
    </div>
  </div>
</div>
```

**Usage**: Top of every page
**Responsive**: Collapses to hamburger menu on mobile

### Breadcrumbs

```html
<div class="breadcrumbs text-sm">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/search">Search</a></li>
    <li>Results</li>
  </ul>
</div>
```

**Usage**: Below navbar, shows navigation path

---

## 2. Forms

### Search Input

```html
<div class="form-control">
  <label class="label">
    <span class="label-text">Search</span>
  </label>
  <div class="join">
    <input type="text"
           placeholder="Search..."
           class="input input-bordered join-item w-full" />
    <button class="btn btn-primary join-item">
      <svg><!-- Search icon --></svg>
    </button>
  </div>
</div>
```

**Validation**: Minimum 3 characters
**Error State**: Add `input-error` class

### Text Input with Label

```html
<div class="form-control w-full">
  <label class="label">
    <span class="label-text">Field Name</span>
    <span class="label-text-alt text-error">*</span>
  </label>
  <input type="text"
         placeholder="Enter value"
         class="input input-bordered w-full" />
  <label class="label">
    <span class="label-text-alt text-error">Error message</span>
  </label>
</div>
```

### Select Dropdown

```html
<div class="form-control w-full">
  <label class="label">
    <span class="label-text">Select Option</span>
  </label>
  <select class="select select-bordered w-full">
    <option disabled selected>Choose...</option>
    <option>Option 1</option>
    <option>Option 2</option>
  </select>
</div>
```

### Filter Panel

```html
<div class="card bg-base-100 shadow-sm">
  <div class="card-body">
    <h3 class="card-title text-base">Filters</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Filter fields -->
    </div>
    <div class="card-actions justify-end mt-4">
      <button class="btn btn-ghost">Reset</button>
      <button class="btn btn-primary">Apply</button>
    </div>
  </div>
</div>
```

---

## 3. Data Display

### Data Table

```html
<div class="overflow-x-auto">
  <table class="table table-zebra">
    <thead>
      <tr>
        <th>
          <label>
            <input type="checkbox" class="checkbox" />
          </label>
        </th>
        <th>Column 1</th>
        <th>Column 2</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <label>
            <input type="checkbox" class="checkbox" />
          </label>
        </td>
        <td>Value 1</td>
        <td>Value 2</td>
        <td>
          <button class="btn btn-ghost btn-xs">View</button>
          <button class="btn btn-ghost btn-xs">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Features**:
- Zebra striping for readability
- Row selection checkboxes
- Action buttons per row

### Pagination

```html
<div class="flex justify-between items-center">
  <span class="text-sm">Showing 1-10 of 100</span>
  <div class="join">
    <button class="join-item btn btn-sm">«</button>
    <button class="join-item btn btn-sm btn-active">1</button>
    <button class="join-item btn btn-sm">2</button>
    <button class="join-item btn btn-sm">3</button>
    <button class="join-item btn btn-sm">»</button>
  </div>
</div>
```

### Detail Card

```html
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <div class="flex justify-between items-start">
      <h2 class="card-title">Item Title</h2>
      <div class="badge badge-primary">Status</div>
    </div>
    <div class="divider"></div>
    <dl class="grid grid-cols-2 gap-4">
      <div>
        <dt class="text-sm text-base-content/70">Field 1</dt>
        <dd class="font-medium">Value 1</dd>
      </div>
      <div>
        <dt class="text-sm text-base-content/70">Field 2</dt>
        <dd class="font-medium">Value 2</dd>
      </div>
    </dl>
    <div class="card-actions justify-end mt-4">
      <button class="btn btn-outline">Cancel</button>
      <button class="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

---

## 4. Feedback

### Toast Notifications

```html
<div class="toast toast-end">
  <div class="alert alert-success">
    <span>Operation completed successfully.</span>
  </div>
</div>
```

**Variants**: `alert-success`, `alert-error`, `alert-warning`, `alert-info`

### Loading States

```html
<!-- Spinner -->
<span class="loading loading-spinner loading-md"></span>

<!-- Skeleton -->
<div class="skeleton h-4 w-full"></div>

<!-- Full page loading -->
<div class="flex items-center justify-center h-64">
  <span class="loading loading-lg"></span>
</div>
```

### Empty State

```html
<div class="text-center py-12">
  <svg class="mx-auto h-12 w-12 text-base-content/30">
    <!-- Empty icon -->
  </svg>
  <h3 class="mt-2 text-lg font-medium">No results found</h3>
  <p class="mt-1 text-sm text-base-content/70">
    Try adjusting your search criteria.
  </p>
</div>
```

---

## 5. Modals

### Confirmation Modal

```html
<dialog id="confirm_modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Confirm Action</h3>
    <p class="py-4">Are you sure you want to proceed?</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn btn-ghost">Cancel</button>
        <button class="btn btn-primary">Confirm</button>
      </form>
    </div>
  </div>
</dialog>
```

### Form Modal

```html
<dialog id="form_modal" class="modal">
  <div class="modal-box w-11/12 max-w-2xl">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <h3 class="font-bold text-lg">Form Title</h3>
    <div class="py-4">
      <!-- Form fields -->
    </div>
    <div class="modal-action">
      <button class="btn btn-ghost">Cancel</button>
      <button class="btn btn-primary">Submit</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
```

---

## 6. Layout

### Page Container

```html
<div class="container mx-auto px-4 py-6">
  <!-- Page content -->
</div>
```

### Two Column Layout

```html
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2">
    <!-- Main content -->
  </div>
  <div>
    <!-- Sidebar -->
  </div>
</div>
```

### Stats Dashboard

```html
<div class="stats shadow">
  <div class="stat">
    <div class="stat-title">Total Records</div>
    <div class="stat-value">1,234</div>
    <div class="stat-desc">↗︎ 12% from last month</div>
  </div>
  <div class="stat">
    <div class="stat-title">Active Users</div>
    <div class="stat-value">567</div>
    <div class="stat-desc">↘︎ 3% from last week</div>
  </div>
</div>
```

---

## 7. Buttons

### Button Variants

```html
<!-- Primary -->
<button class="btn btn-primary">Primary</button>

<!-- Secondary -->
<button class="btn btn-secondary">Secondary</button>

<!-- Outline -->
<button class="btn btn-outline">Outline</button>

<!-- Ghost -->
<button class="btn btn-ghost">Ghost</button>

<!-- With Icon -->
<button class="btn btn-primary">
  <svg><!-- Icon --></svg>
  Button
</button>

<!-- Loading -->
<button class="btn btn-primary">
  <span class="loading loading-spinner loading-sm"></span>
  Loading
</button>

<!-- Disabled -->
<button class="btn btn-primary" disabled>Disabled</button>
```

### Button Sizes

```html
<button class="btn btn-xs">Extra Small</button>
<button class="btn btn-sm">Small</button>
<button class="btn">Default</button>
<button class="btn btn-lg">Large</button>
```

---

## 8. Status Badges

```html
<!-- Status indicators -->
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-error">Inactive</span>
<span class="badge badge-info">Processing</span>
<span class="badge badge-ghost">Draft</span>

<!-- Outline variants -->
<span class="badge badge-outline badge-success">Verified</span>
```

---

## Component Checklist

- [ ] All components follow style guide
- [ ] Components are responsive
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Accessibility attributes added
- [ ] Keyboard navigation works

---

**Created**: [DATE]
**Last Updated**: [DATE]
**Related**: Step 04 UI Design Guidelines
