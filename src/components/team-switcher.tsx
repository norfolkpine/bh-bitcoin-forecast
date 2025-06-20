'use client'

import * as React from 'react'
import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/registry/new-york/ui/avatar'
import { Button } from '@/registry/new-york/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/registry/new-york/ui/command'
import { useTeam } from '@/contexts/team-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/new-york/ui/dialog'
import { Input } from '@/registry/new-york/ui/input'
import { Label } from '@/registry/new-york/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/new-york/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/new-york/ui/select'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

type Team = {
  label: string
  value: string
  slug?: string
}

type Group = {
  label: string
  teams: Team[]
}

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface TeamSwitcherProps extends PopoverTriggerProps {}

export default function TeamSwitcher({ className }: TeamSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const { setSelectedTeam: setActiveTeam } = useTeam()
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false)
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)
  const [groups, setGroups] = React.useState<Group[]>([
    { label: 'Teams', teams: [] },
  ])
  const [teamName, setTeamName] = React.useState('')
  const [_, setSubscriptionPlan] = React.useState('')

  React.useEffect(() => {
    const fetchTeams = async () => {
      const token = localStorage.getItem('accessToken')
      try {
        const response = await fetch(`${apiBaseUrl}/teams/api/teams/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()

        const teams = data.results.map((team: any) => ({
          label: team.name,
          value: team.id.toString(),
          slug: team.slug.toString(),
          id: team.id.toString(),
        }))

        setGroups([{ label: 'Teams', teams }])

        if (teams.length > 0) {
          setSelectedTeam(teams[0])
          setActiveTeam(teams[0])
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
      }
    }

    fetchTeams()
  }, [setActiveTeam])

  const handleCreateTeam = async () => {
    const slug = teamName.toLowerCase().replace(/\s+/g, '-')
    const token = localStorage.getItem('accessToken')
    try {
      const response = await fetch(`${apiBaseUrl}/teams/api/teams/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: teamName,
          slug: slug,
        }),
      })

      if (response.ok) {
        setShowNewTeamDialog(false)
        const newTeam = await response.json()

        setGroups((prevGroups) => [
          {
            label: 'Teams',
            teams: [
              ...prevGroups[0].teams,
              { label: newTeam.name, value: newTeam.id.toString() },
            ],
          },
        ])

        setSelectedTeam({ label: newTeam.name, value: newTeam.id.toString() })
        setActiveTeam({
          label: newTeam.name,
          value: newTeam.id.toString(),
          slug: newTeam.slug,
          id: newTeam.id,
        })
      } else {
        console.error('Failed to create team')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            aria-label='Select a team'
            className={cn('w-[200px] justify-between', className)}
          >
            <Avatar className='mr-2 h-5 w-5'>
              <AvatarImage
                src={`https://avatar.vercel.sh/${selectedTeam?.value}.png`}
                alt={selectedTeam?.label || 'Team'}
                className='grayscale'
              />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            {selectedTeam ? selectedTeam.label : 'Select a team'}
            <CaretSortIcon className='ml-auto h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[200px] p-0'>
          <Command>
            <CommandInput placeholder='Search team...' />
            <CommandList>
              <CommandEmpty>No team found.</CommandEmpty>
              {groups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.teams.map((team) => (
                    <CommandItem
                      key={team.value}
                      onSelect={() => {
                        setSelectedTeam(team)
                        setActiveTeam(team)
                        setOpen(false)
                      }}
                      className='text-sm'
                    >
                      <Avatar className='mr-2 h-5 w-5'>
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${team.value}.png`}
                          alt={team.label}
                          className='grayscale'
                        />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      {team.label}
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          selectedTeam?.value === team.value
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowNewTeamDialog(true)
                    }}
                  >
                    <PlusCircledIcon className='mr-2 h-5 w-5' />
                    Create Team
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>
            Add a new team to manage products and customers.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className='space-y-4 py-2 pb-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Team name</Label>
              <Input
                id='name'
                placeholder='BH Crypto'
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='plan'>Subscription plan</Label>
              <Select onValueChange={(value) => setSubscriptionPlan(value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a plan' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='free'>
                    <span className='font-medium'>Free</span> -{' '}
                    <span className='text-muted-foreground'>
                      Trial for two weeks
                    </span>
                  </SelectItem>
                  <SelectItem value='pro'>
                    <span className='font-medium'>Pro</span> -{' '}
                    <span className='text-muted-foreground'>
                      $9/month per user
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setShowNewTeamDialog(false)}>
            Cancel
          </Button>
          <Button type='button' onClick={handleCreateTeam}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
