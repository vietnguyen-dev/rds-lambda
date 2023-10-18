CREATE TABLE
    cats (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(32) NULL,
        address VARCHAR(255) NULL,
        owner VARCHAR(64) NULL,
        breed VARCHAR(64) NULL,
        stray BOOLEAN NOT NULL
    );

INSERT INTO
    cats (
        name,
        color,
        address,
        owner,
        breed,
        stray
    )
VALUES (
        'Ash',
        'gray and white striped',
        '23 NE 143rd Ave',
        'Thomas',
        'Scottish Fold / Munchkin',
        false
    );