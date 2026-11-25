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
}
