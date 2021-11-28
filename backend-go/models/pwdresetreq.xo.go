package models

// Code generated by xo. DO NOT EDIT.

import (
	"context"
	"database/sql"
	"time"
)

// PwdResetReq represents a row from 'public.pwd_reset_req'.
type PwdResetReq struct {
	ID        int            `json:"id"`         // id
	Email     sql.NullString `json:"email"`      // email
	Message   sql.NullString `json:"message"`    // message
	CreatedAt time.Time      `json:"created_at"` // created_at
	UpdatedAt time.Time      `json:"updated_at"` // updated_at
	// xo fields
	_exists, _deleted bool
}

// Exists returns true when the PwdResetReq exists in the database.
func (prr *PwdResetReq) Exists() bool {
	return prr._exists
}

// Deleted returns true when the PwdResetReq has been marked for deletion from
// the database.
func (prr *PwdResetReq) Deleted() bool {
	return prr._deleted
}

// Insert inserts the PwdResetReq to the database.
func (prr *PwdResetReq) Insert(ctx context.Context, db DB) error {
	switch {
	case prr._exists: // already exists
		return logerror(&ErrInsertFailed{ErrAlreadyExists})
	case prr._deleted: // deleted
		return logerror(&ErrInsertFailed{ErrMarkedForDeletion})
	}
	// insert (primary key generated and returned by database)
	const sqlstr = `INSERT INTO public.pwd_reset_req (` +
		`email, message, created_at, updated_at` +
		`) VALUES (` +
		`$1, $2, $3, $4` +
		`) RETURNING id`
	// run
	logf(sqlstr, prr.Email, prr.Message, prr.CreatedAt, prr.UpdatedAt)
	if err := db.QueryRowContext(ctx, sqlstr, prr.Email, prr.Message, prr.CreatedAt, prr.UpdatedAt).Scan(&prr.ID); err != nil {
		return logerror(err)
	}
	// set exists
	prr._exists = true
	return nil
}

// Update updates a PwdResetReq in the database.
func (prr *PwdResetReq) Update(ctx context.Context, db DB) error {
	switch {
	case !prr._exists: // doesn't exist
		return logerror(&ErrUpdateFailed{ErrDoesNotExist})
	case prr._deleted: // deleted
		return logerror(&ErrUpdateFailed{ErrMarkedForDeletion})
	}
	// update with composite primary key
	const sqlstr = `UPDATE public.pwd_reset_req SET ` +
		`email = $1, message = $2, created_at = $3, updated_at = $4 ` +
		`WHERE id = $5`
	// run
	logf(sqlstr, prr.Email, prr.Message, prr.CreatedAt, prr.UpdatedAt, prr.ID)
	if _, err := db.ExecContext(ctx, sqlstr, prr.Email, prr.Message, prr.CreatedAt, prr.UpdatedAt, prr.ID); err != nil {
		return logerror(err)
	}
	return nil
}

// Save saves the PwdResetReq to the database.
func (prr *PwdResetReq) Save(ctx context.Context, db DB) error {
	if prr.Exists() {
		return prr.Update(ctx, db)
	}
	return prr.Insert(ctx, db)
}

// Upsert performs an upsert for PwdResetReq.
func (prr *PwdResetReq) Upsert(ctx context.Context, db DB) error {
	switch {
	case prr._deleted: // deleted
		return logerror(&ErrUpsertFailed{ErrMarkedForDeletion})
	}
	// upsert
	const sqlstr = `INSERT INTO public.pwd_reset_req (` +
		`id, email, message, created_at, updated_at` +
		`) VALUES (` +
		`$1, $2, $3, $4, $5` +
		`)` +
		` ON CONFLICT (id) DO ` +
		`UPDATE SET ` +
		`email = EXCLUDED.email, message = EXCLUDED.message, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at `
	// run
	logf(sqlstr, prr.ID, prr.Email, prr.Message, prr.CreatedAt, prr.UpdatedAt)
	if _, err := db.ExecContext(ctx, sqlstr, prr.ID, prr.Email, prr.Message, prr.CreatedAt, prr.UpdatedAt); err != nil {
		return logerror(err)
	}
	// set exists
	prr._exists = true
	return nil
}

// Delete deletes the PwdResetReq from the database.
func (prr *PwdResetReq) Delete(ctx context.Context, db DB) error {
	switch {
	case !prr._exists: // doesn't exist
		return nil
	case prr._deleted: // deleted
		return nil
	}
	// delete with single primary key
	const sqlstr = `DELETE FROM public.pwd_reset_req ` +
		`WHERE id = $1`
	// run
	logf(sqlstr, prr.ID)
	if _, err := db.ExecContext(ctx, sqlstr, prr.ID); err != nil {
		return logerror(err)
	}
	// set deleted
	prr._deleted = true
	return nil
}

// PwdResetReqByEmail retrieves a row from 'public.pwd_reset_req' as a PwdResetReq.
//
// Generated from index 'pwd_reset_req_email_key'.
func PwdResetReqByEmail(ctx context.Context, db DB, email sql.NullString) (*PwdResetReq, error) {
	// query
	const sqlstr = `SELECT ` +
		`id, email, message, created_at, updated_at ` +
		`FROM public.pwd_reset_req ` +
		`WHERE email = $1`
	// run
	logf(sqlstr, email)
	prr := PwdResetReq{
		_exists: true,
	}
	if err := db.QueryRowContext(ctx, sqlstr, email).Scan(&prr.ID, &prr.Email, &prr.Message, &prr.CreatedAt, &prr.UpdatedAt); err != nil {
		return nil, logerror(err)
	}
	return &prr, nil
}

// PwdResetReqByID retrieves a row from 'public.pwd_reset_req' as a PwdResetReq.
//
// Generated from index 'pwd_reset_req_pkey'.
func PwdResetReqByID(ctx context.Context, db DB, id int) (*PwdResetReq, error) {
	// query
	const sqlstr = `SELECT ` +
		`id, email, message, created_at, updated_at ` +
		`FROM public.pwd_reset_req ` +
		`WHERE id = $1`
	// run
	logf(sqlstr, id)
	prr := PwdResetReq{
		_exists: true,
	}
	if err := db.QueryRowContext(ctx, sqlstr, id).Scan(&prr.ID, &prr.Email, &prr.Message, &prr.CreatedAt, &prr.UpdatedAt); err != nil {
		return nil, logerror(err)
	}
	return &prr, nil
}

// User returns the User associated with the PwdResetReq's (Email).
//
// Generated from foreign key 'pwd_reset_req_email_fkey'.
func (prr *PwdResetReq) User(ctx context.Context, db DB) (*User, error) {
	return UserByEmail(ctx, db, prr.Email.String)
}
