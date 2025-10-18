# 📅 MindYourEvent

MindYourEvent is a web application that simplifies event scheduling by allowing organizers to create events, invite participants, and find the perfect time for everyone without the endless back-and-forth emails. 🚀

## ✨ Key Features

-   **Easy Event Creation**: Quickly set up an event with a title, description, date range, and participant emails.
-   **📧 Email-Based Authentication**: Securely verify users with a one-time code sent to their email, no passwords needed.
-   **✉️ Unique Invitation Links**: Each participant receives a unique link to submit their availability.
-   **📊 Visual Availability Heatmap**: A clear and intuitive heatmap shows the best times for the event based on participant availability.
-   **🏆 Smart Time Slot Suggestions**: The app automatically suggests the best time slots based on when most people are free.
-   **🔒 RSVP Tracking**: After an event is finalized, participants can RSVP to confirm their attendance.
-   **🔔 Automated Notifications**: Participants are automatically notified via email when an event time is finalized.
-   **📱 Responsive Design**: A clean and modern UI that works great on both desktop and mobile devices.

## ⚙️ How It Works

1.  **Create an Event**: The organizer fills out a simple form with the event details, a potential date range, and a list of participant emails.
2.  **Share Invite Links**: The app generates a unique invitation link for each participant. The organizer shares these links with the corresponding participants.
3.  **Submit Availability**: Participants use their unique link to access a page where they can select their available time slots within the given date range.
4.  **View Results**: The organizer can view a dashboard that visualizes everyone's availability on a heatmap and lists the most popular time slots.
5.  **Finalize the Event**: Based on the results, the organizer chooses the final date and time for the event.
6.  **Get Notified**: All participants receive an email notification with the final event details.
7.  **RSVP**: Participants can then use their invitation link to RSVP and confirm whether they will attend the event.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (React)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
-   **Database**: [Supabase](https://supabase.io/) (PostgreSQL)
-   **Authentication**: Email-based (passwordless) with Supabase Auth
-   **Email**: [Resend](https://resend.com/) for sending email notifications
-   **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or higher)
-   npm, yarn, or pnpm
-   A Supabase account and project
-   A Resend account and API key

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/guimaraesr-y/mind-your-event.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your environment variables by creating a `.env.local` file in the root of the project. See the `.env.example` file for the required variables.

### Environment Variables

You will need to add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
```

### Database Setup

The SQL script to create the necessary tables is located in `scripts/001_create_tables.sql`. You can run this script in the Supabase SQL editor to set up your database schema.

### Running the Application

Once you have completed the setup steps, you can run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.