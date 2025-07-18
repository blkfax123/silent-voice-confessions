import { useState } from 'react';
import { Users, MessageSquare, CheckCircle, XCircle, Eye, Trash2, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data - TODO: Replace with Supabase data
const mockConfessions = [
  {
    id: '1',
    anonymousId: '#Voice3021',
    category: 'Love',
    duration: 45,
    reactions: { heart: 12, laugh: 3, sad: 1, mind_blown: 8 },
    isBoosted: false,
    createdAt: '2024-01-15T10:30:00Z',
    userId: 'user_1'
  },
  {
    id: '2',
    anonymousId: '#Voice1547',
    category: 'Career',
    duration: 58,
    reactions: { heart: 5, laugh: 2, sad: 9, mind_blown: 3 },
    isBoosted: true,
    createdAt: '2024-01-15T09:15:00Z',
    userId: 'user_2'
  }
];

const mockUsers = [
  {
    id: 'user_1',
    username: 'user123',
    isVerified: false,
    confessionCount: 3,
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 'user_2',
    username: 'anonymous456',
    isVerified: true,
    confessionCount: 7,
    createdAt: '2024-01-08T14:30:00Z'
  }
];

const mockVerificationRequests = [
  {
    id: 'req_1',
    userId: 'user_1',
    username: 'user123',
    status: 'pending',
    submittedAt: '2024-01-14T12:00:00Z'
  }
];

const mockLoginLogs = [
  {
    id: 'log_1',
    usernameAttempted: 'blkfax1',
    loginSuccess: true,
    timestamp: '2024-01-15T11:00:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'log_2',
    usernameAttempted: 'user123',
    loginSuccess: true,
    timestamp: '2024-01-15T10:45:00Z',
    ipAddress: '192.168.1.101'
  },
  {
    id: 'log_3',
    usernameAttempted: 'hacker',
    loginSuccess: false,
    timestamp: '2024-01-15T10:30:00Z',
    ipAddress: '192.168.1.102'
  }
];

export function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const handleDeleteConfession = (id: string) => {
    console.log('Delete confession:', id);
    // TODO: Implement with Supabase
  };

  const handleBoostConfession = (id: string) => {
    console.log('Boost confession:', id);
    // TODO: Implement with Supabase
  };

  const handleVerifyUser = (userId: string, approve: boolean) => {
    console.log('Verify user:', userId, approve);
    // TODO: Implement with Supabase
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage Silent Circle community and content</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="confessions" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Confessions
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Login Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Confessions</p>
                  <p className="text-2xl font-bold text-primary">248</p>
                </div>
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-primary">127</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified Users</p>
                  <p className="text-2xl font-bold text-primary">23</p>
                </div>
                <CheckCircle className="w-8 h-8 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold text-primary">5</p>
                </div>
                <Eye className="w-8 h-8 text-muted-foreground" />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="confessions" className="space-y-4">
          <div className="space-y-4">
            {mockConfessions.map((confession) => (
              <Card key={confession.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="anonymous-tag">{confession.anonymousId}</span>
                    <Badge variant="secondary">{confession.category}</Badge>
                    {confession.isBoosted && (
                      <Badge className="bg-primary-glow/20 text-primary-glow">
                        <Zap className="w-3 h-3 mr-1" />
                        Boosted
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBoostConfession(confession.id)}
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteConfession(confession.id)}
                      className="border-destructive/30 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  Duration: {confession.duration}s • Created: {formatDate(confession.createdAt)}
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span>❤️ {confession.reactions.heart}</span>
                  <span>😂 {confession.reactions.laugh}</span>
                  <span>😢 {confession.reactions.sad}</span>
                  <span>🤯 {confession.reactions.mind_blown}</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confessions</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.confessionCount}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <div className="space-y-4">
            {mockVerificationRequests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{request.username}</h4>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {formatDate(request.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyUser(request.userId, true)}
                      className="border-green-500/30 hover:bg-green-500/10"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyUser(request.userId, false)}
                      className="border-destructive/30 hover:bg-destructive/10"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLoginLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.usernameAttempted}</TableCell>
                  <TableCell>
                    <Badge variant={log.loginSuccess ? 'default' : 'destructive'}>
                      {log.loginSuccess ? 'Success' : 'Failed'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}