<?php

namespace App\Domain\Access;

enum Role: string
{
    case SuperAdmin = 'super-admin';
    case MembershipSecretary = 'membership-secretary';
    case BatchRepresentative = 'batch-representative';
    case Treasurer = 'treasurer';
    case ContentEditor = 'content-editor';
    case CommitteeMember = 'committee-member';
    case Member = 'member';

    /**
     * Roles that work in the admin portal (dashboard and /admin pages).
     * Everyone else, ordinary members, applicants and committee members
     * without an office, uses the My account page on the public site.
     *
     * @return list<self>
     */
    public static function adminPortal(): array
    {
        return [self::SuperAdmin, self::MembershipSecretary, self::BatchRepresentative, self::Treasurer, self::ContentEditor];
    }

    /** @return list<string> */
    public static function adminPortalNames(): array
    {
        return array_map(fn (self $role) => $role->value, self::adminPortal());
    }
}
