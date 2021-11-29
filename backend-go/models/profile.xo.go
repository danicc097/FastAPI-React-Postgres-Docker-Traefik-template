package models

// Code generated by xo. DO NOT EDIT.

import (
	"context"
	"database/sql"
	"time"
)

// Profile represents a row from 'public.profiles'.
type Profile struct {
	ID          int            `json:"id"`           // id
	FullName    sql.NullString `json:"full_name"`    // full_name
	PhoneNumber sql.NullString `json:"phone_number"` // phone_number
	Bio         sql.NullString `json:"bio"`          // bio
	Image       sql.NullString `json:"image"`        // image
	UserID      sql.NullInt64  `json:"user_id"`      // user_id
	CreatedAt   time.Time      `json:"created_at"`   // created_at
	UpdatedAt   time.Time      `json:"updated_at"`   // updated_at
	// xo fields
	_exists, _deleted bool
}

// Exists returns true when the Profile exists in the database.
func (p *Profile) Exists() bool {
	return p._exists
}

// Deleted returns true when the Profile has been marked for deletion from
// the database.
func (p *Profile) Deleted() bool {
	return p._deleted
}

// Insert inserts the Profile to the database.
func (p *Profile) Insert(ctx context.Context, db DB) error {
	switch {
	case p._exists: // already exists
		return logerror(&ErrInsertFailed{ErrAlreadyExists})
	case p._deleted: // deleted
		return logerror(&ErrInsertFailed{ErrMarkedForDeletion})
	}
	// insert (primary key generated and returned by database)
	const sqlstr = `INSERT INTO public.profiles (` +
		`full_name, phone_number, bio, image, user_id, created_at, updated_at` +
		`) VALUES (` +
		`$1, $2, $3, $4, $5, $6, $7` +
		`) RETURNING id`
	// run
	logf(sqlstr, p.FullName, p.PhoneNumber, p.Bio, p.Image, p.UserID, p.CreatedAt, p.UpdatedAt)
	if err := db.QueryRowContext(ctx, sqlstr, p.FullName, p.PhoneNumber, p.Bio, p.Image, p.UserID, p.CreatedAt, p.UpdatedAt).Scan(&p.ID); err != nil {
		return logerror(err)
	}
	// set exists
	p._exists = true
	return nil
}

// Update updates a Profile in the database.
func (p *Profile) Update(ctx context.Context, db DB) error {
	switch {
	case !p._exists: // doesn't exist
		return logerror(&ErrUpdateFailed{ErrDoesNotExist})
	case p._deleted: // deleted
		return logerror(&ErrUpdateFailed{ErrMarkedForDeletion})
	}
	// update with composite primary key
	const sqlstr = `UPDATE public.profiles SET ` +
		`full_name = $1, phone_number = $2, bio = $3, image = $4, user_id = $5, created_at = $6, updated_at = $7 ` +
		`WHERE id = $8`
	// run
	logf(sqlstr, p.FullName, p.PhoneNumber, p.Bio, p.Image, p.UserID, p.CreatedAt, p.UpdatedAt, p.ID)
	if _, err := db.ExecContext(ctx, sqlstr, p.FullName, p.PhoneNumber, p.Bio, p.Image, p.UserID, p.CreatedAt, p.UpdatedAt, p.ID); err != nil {
		return logerror(err)
	}
	return nil
}

// Save saves the Profile to the database.
func (p *Profile) Save(ctx context.Context, db DB) error {
	if p.Exists() {
		return p.Update(ctx, db)
	}
	return p.Insert(ctx, db)
}

// Upsert performs an upsert for Profile.
func (p *Profile) Upsert(ctx context.Context, db DB) error {
	switch {
	case p._deleted: // deleted
		return logerror(&ErrUpsertFailed{ErrMarkedForDeletion})
	}
	// upsert
	const sqlstr = `INSERT INTO public.profiles (` +
		`id, full_name, phone_number, bio, image, user_id, created_at, updated_at` +
		`) VALUES (` +
		`$1, $2, $3, $4, $5, $6, $7, $8` +
		`)` +
		` ON CONFLICT (id) DO ` +
		`UPDATE SET ` +
		`full_name = EXCLUDED.full_name, phone_number = EXCLUDED.phone_number, bio = EXCLUDED.bio, image = EXCLUDED.image, user_id = EXCLUDED.user_id, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at `
	// run
	logf(sqlstr, p.ID, p.FullName, p.PhoneNumber, p.Bio, p.Image, p.UserID, p.CreatedAt, p.UpdatedAt)
	if _, err := db.ExecContext(ctx, sqlstr, p.ID, p.FullName, p.PhoneNumber, p.Bio, p.Image, p.UserID, p.CreatedAt, p.UpdatedAt); err != nil {
		return logerror(err)
	}
	// set exists
	p._exists = true
	return nil
}

// Delete deletes the Profile from the database.
func (p *Profile) Delete(ctx context.Context, db DB) error {
	switch {
	case !p._exists: // doesn't exist
		return nil
	case p._deleted: // deleted
		return nil
	}
	// delete with single primary key
	const sqlstr = `DELETE FROM public.profiles ` +
		`WHERE id = $1`
	// run
	logf(sqlstr, p.ID)
	if _, err := db.ExecContext(ctx, sqlstr, p.ID); err != nil {
		return logerror(err)
	}
	// set deleted
	p._deleted = true
	return nil
}

// ProfileByID retrieves a row from 'public.profiles' as a Profile.
//
// Generated from index 'profiles_pkey'.
func ProfileByID(ctx context.Context, db DB, id int) (*Profile, error) {
	// query
	const sqlstr = `SELECT ` +
		`id, full_name, phone_number, bio, image, user_id, created_at, updated_at ` +
		`FROM public.profiles ` +
		`WHERE id = $1`
	// run
	logf(sqlstr, id)
	p := Profile{
		_exists: true,
	}
	if err := db.QueryRowContext(ctx, sqlstr, id).Scan(&p.ID, &p.FullName, &p.PhoneNumber, &p.Bio, &p.Image, &p.UserID, &p.CreatedAt, &p.UpdatedAt); err != nil {
		return nil, logerror(err)
	}
	return &p, nil
}

// User returns the User associated with the Profile's (UserID).
//
// Generated from foreign key 'profiles_user_id_fkey'.
func (p *Profile) User(ctx context.Context, db DB) (*User, error) {
	return UserByID(ctx, db, int(p.UserID.Int64))
}