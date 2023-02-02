DO $$ BEGIN
    create type weekday as enum ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

drop table if exists users cascade;
create table if not exists users (
    user_id integer primary key,
    name varchar
);

drop table if exists dining_hall cascade;
create table if not exists dining_hall (
    dining_hall_id integer primary key,
    name varchar
);

drop table if exists pool_entry cascade;
create table if not exists pool_entry (
    dining_hall_id integer references dining_hall,
    user_id integer references users,
    wants_swipe boolean not null,
    available_times interval not null
);

drop table if exists dining_hall_hours cascade;
create table if not exists dining_hall_hours (
    dining_hall_hours_id integer primary key not null,
    dining_hall_id integer references dining_hall on delete cascade,
    weekday WEEKDAY,
    opening timestamptz,
    closing timestamptz,
    special_hours boolean
);
