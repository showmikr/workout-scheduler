# Resistance Training App

## Features :pencil2:

- Build your own custom workout templates
- Choose from a variety of built-in exercises or make your own!
- Graph your calories burned, body weight, and more
- Track your PRs (Personal Records)
- View your workout history

## Screenshots :camera:

### See the designs on [Figma](https://www.figma.com/design/agfI7UZ5xe542eTNCxVpqs/Workout-Scheduler?node-id=594-209&node-type=CANVAS)

![Screenshot](/readme_assets/active_workout.png)
![Screenshot](/readme_assets/summary_graph.png)

## DB Schema :scroll:

If you get the data model right...

```mermaid
erDiagram
    app_user ||--o{ workout : has
    app_user ||--o{ workout_tag : has
    app_user ||--o{ exercise_class : has
    app_user ||--o{ workout_session : has
    app_user ||--o{ user_bodyweight : has
    workout ||--o{ link_tag_workout : has
    workout_tag ||--o{ link_tag_workout : has
    workout ||--o{ workout_days : has
    workout ||--o{ exercise : has
    exercise_class ||--o{ exercise : has
    exercise_class ||--o{ pr_history : has
    exercise ||--o{ exercise_set : has
    exercise_set ||--o| resistance_set : has
    exercise_set ||--o| cardio_set : has
    workout_session ||--o{ exercise_session : has
    exercise_session ||--o{ set_session : has
    exercise_type ||--o{ exercise_class : has
    exercise_equipment ||--o{ exercise_class : has
    body_part ||--o{ exercise_class : has

    app_user {
        integer id PK
        uuid aws_cognito_sub
        text first_name
        text last_name
        text user_name
        text email
        boolean email_verified
        text image_url
        text creation_date
        text last_signed_in
        int avg_daily_calorie_goal
        real bodyweight_goal
        real user_height
    }
    workout {
        integer id PK
        bigint app_user_id FK
        text title
        int list_order
        text last_session
    }
    workout_tag {
        integer id PK
        bigint app_user_id FK
        text title
    }
    link_tag_workout {
        integer id PK
        bigint workout_tag_id FK
        bigint workout_id FK
    }
    workout_days {
        integer id PK
        bigint workout_id FK
        text day
    }
    exercise_class {
        integer id PK
        bigint app_user_id FK
        bigint exercise_type_id FK
        bigint exercise_equipment_id FK
        bigint body_part_id FK
        boolean is_archived
        text title
    }
    exercise {
        integer id PK
        bigint exercise_class_id FK
        bigint workout_id FK
        int list_order
        real initial_weight
        text notes
    }
    exercise_set {
        integer id PK
        bigint exercise_id FK
        text title
        int list_order
        int reps
        int rest_time
    }
    resistance_set {
        integer id PK
        bigint exercise_set_id FK
        real total_weight
    }
    cardio_set {
        integer id PK
        bigint exercise_set_id FK
        real target_distance
        int target_time
    }
    workout_session {
        integer id PK
        bigint app_user_id FK
        text title
        text started_on
        text ended_on
        int calories
    }
    exercise_session {
        integer id PK
        bigint workout_session_id FK
        bigint exercise_class_id FK
    }
    set_session {
        integer id PK
        bigint exercise_session_id FK
        int reps
        int rest_time
        boolean completed
        int set_type
        real total_weight
        real target_distance
        int target_time
        real actual_distance
        int actual_time
    }
    user_bodyweight {
        integer id PK
        bigint app_user_id FK
        real weight
        text date
    }
    pr_history {
        integer id PK
        bigint exercise_class_id FK
        real weight
        int reps
        real distance
        int time
        text date
    }
    exercise_type {
        integer id PK
        text title
    }
    exercise_equipment {
        integer id PK
        text title
    }
    body_part {
        integer id PK
        text title
    }
```

## In Progress :memo:

- Integrate active workout session
- Make plate based weight calculator
- Revamp the Summary Page w/ improved graphs
