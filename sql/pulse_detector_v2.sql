DROP TABLE IF EXISTS heart_rate;
DROP TABLE IF EXISTS record;
DROP TABLE IF EXISTS identifier;

DROP TABLE IF EXISTS measurement;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS image;

CREATE TABLE user (
    id int NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    jmbag CHAR(10) DEFAULT NULL UNIQUE,
    active_since timestamp DEFAULT NOW(),
    last_access_date timestamp NULL DEFAULT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE image (
	id int NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE measurement(
	id int NOT NULL AUTO_INCREMENT,
    bpm int NOT NULL,
    time timestamp NOT NULL,
    image_id int NOT NULL,
    user_id int NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (image_id) REFERENCES image(id)
);

