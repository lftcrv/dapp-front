# PRD: Creators Page (/creators)

**Issue:** https://github.com/lftcrv/dapp-front/issues/116

## 1. Project Overview

Create a dedicated page within the dapp, accessible via the `/creators` route, to showcase a list of all agent creators. This page aims to enhance discoverability and allow users to easily browse through the platform's creators. The initial version will focus on the list view, with individual creator detail pages planned for future implementation.

## 2. Design Perspective & Consistency

*   **Goal:** Design a clean, intuitive, and visually appealing page that feels consistent with the existing application, particularly drawing inspiration from the Agents list/display if applicable. We aim for a top-tier user experience.
*   **Layout:** A responsive grid layout will be used to display creator cards, ensuring optimal viewing across different screen sizes (desktop, tablet, mobile).
*   **Style:** Adhere strictly to the existing design system (fonts, colors, spacing, component styles found in `components/ui/` and `globals.css`). Leverage existing components where possible.
*   **Inspiration:** While there isn't a direct `app/agents/page.tsx`, we can look at components like `components/agents/agent-table.tsx` and `components/top-agents.tsx` for potential card layout ideas and data presentation styles. The overall page structure should resemble other main sections accessible from the primary navigation.
*   **Loading/Error States:** Implement skeleton loaders for the grid/cards during data fetching and display user-friendly error messages if data retrieval fails.

## 3. Core Functionalities

*   **Routing:** Establish a new route at `/creators`.
*   **Data Fetching:** Retrieve a list of creators from the backend API (endpoint details TBD, assuming it provides necessary info like name, avatar, agent count, key stats). Implement robust loading and error handling. Consider pagination if the API supports it and the creator list is expected to grow large.
*   **UI - Creator List Page (`app/creators/page.tsx`):**
    *   Display a clear page title (e.g., "Creators").
    *   Arrange `CreatorCard` components in a responsive grid.
    *   Handle the display of loading skeletons and error messages.
*   **UI - Creator Card (`components/creators/creator-card.tsx`):**
    *   Display Creator Name/Handle.
    *   Display Creator Avatar.
    *   Display Number of Agents created by the creator.
    *   (Optional/If available) Display a key statistic like Total PnL or similar.
    *   Make the entire card clickable.
    *   On click, navigate to the future creator detail page (`/creators/[creatorId]`, where `[creatorId]` is the creator's unique identifier). Link functionality should be implemented, even if the target page doesn't exist yet.
*   **Navigation:** Add a "Creators" link to the main application navigation (likely within `components/navigation-menu.tsx` or `components/nav.tsx`).

## 4. Required Files/Components

*   **New Page:** `app/creators/page.tsx`
*   **New Component:** `components/creators/creator-card.tsx`
*   **New Directory:** `components/creators/`
*   **Modified Navigation:** `components/navigation-menu.tsx` (or `components/nav.tsx` - needs verification)

## 5. To-Do List

1.  [ ] Create the directory `components/creators/`.
2.  [ ] Create the basic structure for `app/creators/page.tsx`.
3.  [ ] Create the basic structure for `components/creators/creator-card.tsx`.
4.  [ ] Define placeholder/mock data structure for creators.
5.  [ ] Implement the UI layout for `CreatorCard` using placeholder data.
6.  [ ] Implement the UI layout for the `CreatorsPage` (`app/creators/page.tsx`), rendering a grid of `CreatorCard` components using placeholder data.
7.  [ ] Implement basic routing and ensure the `/creators` page is accessible.
8.  [ ] Add the "Creators" link to the main navigation component.
9.  [ ] Implement data fetching logic (replace placeholder data with API call).
10. [ ] Implement loading state (e.g., skeleton loaders) for the page.
11. [ ] Implement error handling state for the page.
12. [ ] Make `CreatorCard` clickable, linking to `/creators/[creatorId]`.
13. [ ] Ensure responsiveness across different screen sizes.
14. [ ] Refine styling for consistency with the application's design system.
15. [ ] Add tests (Unit/Integration). 