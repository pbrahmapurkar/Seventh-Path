/**
 * Seventh Path Design System Demo Screen
 * Showcases all components and patterns from the design system
 */

import React, { useState } from 'react';
import {
    Text,
    Button,
    Card,
    HabitCard,
    Input,
    IconContainer,
    ProgressBar,
    CircularProgress,
    EmptyState,
    BottomSheet,
    Header,
    Stack,
} from './ds';

export const DesignSystemDemo = () => {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [habits, setHabits] = useState([
        { id: 1, title: 'Morning Meditation', subtitle: '5 minutes', completed: true },
        { id: 2, title: 'Evening Reflection', subtitle: '10 minutes', completed: false },
        { id: 3, title: 'Gratitude Journal', subtitle: '3 entries', completed: false },
    ]);

    const toggleHabit = (id: number) => {
        setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
    };

    const completedCount = habits.filter(h => h.completed).length;
    const progress = (completedCount / habits.length) * 100;

    return (
        <div className="sp-safe-top sp-safe-bottom" style={{ minHeight: '100vh', paddingBottom: '24px' }}>
            {/* Header */}
            <Header
                title="Design System"
                leftAction={
                    <button className="sp-header__action" aria-label="Menu">
                        <svg className="sp-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                }
                rightAction={
                    <button className="sp-header__action" aria-label="Settings">
                        <svg className="sp-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                }
            />

            <div className="sp-px-screen">
                {/* Hero Section */}
                <Stack gap={4} style={{ marginTop: '24px', marginBottom: '32px' }}>
                    <Text variant="display" as="h1">Today</Text>
                    <Text variant="body-sm">Your mindful practices</Text>
                </Stack>

                {/* Progress Card */}
                <Card style={{ marginBottom: '24px' }}>
                    <Stack gap={4}>
                        <div className="sp-row" style={{ justifyContent: 'space-between' }}>
                            <Stack gap={2}>
                                <Text variant="title">Today's Progress</Text>
                                <Text variant="caption">{completedCount} of {habits.length}</Text>
                            </Stack>
                            <CircularProgress value={progress} size={64}>
                                <Text variant="body" style={{ fontSize: '14px', fontWeight: 600 }}>
                                    {Math.round(progress)}%
                                </Text>
                            </CircularProgress>
                        </div>
                        <ProgressBar value={completedCount} max={habits.length} />
                    </Stack>
                </Card>

                {/* Habits List */}
                <Stack gap={3} className="sp-stagger-children" style={{ marginBottom: '24px' }}>
                    <Text variant="overline" style={{ marginBottom: '4px' }}>Habits</Text>
                    {habits.map((habit) => (
                        <HabitCard
                            key={habit.id}
                            title={habit.title}
                            subtitle={habit.subtitle}
                            isCompleted={habit.completed}
                            onToggle={() => toggleHabit(habit.id)}
                            leftElement={
                                <div className={`sp-habit-card__checkbox ${habit.completed ? 'checked' : ''}`}>
                                    {habit.completed && (
                                        <svg
                                            className="sp-icon sp-animate-check"
                                            style={{ width: '14px', height: '14px', color: 'white' }}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            }
                        />
                    ))}
                </Stack>

                {/* Feature Cards */}
                <Text variant="overline" style={{ marginBottom: '12px' }}>Features</Text>
                <Stack gap={3} style={{ marginBottom: '24px' }}>
                    <Card>
                        <div className="sp-row" style={{ gap: '12px' }}>
                            <IconContainer>
                                <svg className="sp-icon sp-icon--accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </IconContainer>
                            <Stack gap={1} style={{ flex: 1 }}>
                                <Text variant="title">Insights</Text>
                                <Text variant="body-sm">View your patterns and reflections</Text>
                            </Stack>
                        </div>
                    </Card>

                    <Card>
                        <div className="sp-row" style={{ gap: '12px' }}>
                            <IconContainer>
                                <svg className="sp-icon sp-icon--accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </IconContainer>
                            <Stack gap={1} style={{ flex: 1 }}>
                                <Text variant="title">History</Text>
                                <Text variant="body-sm">Review your journey</Text>
                            </Stack>
                        </div>
                    </Card>
                </Stack>

                {/* Empty State Example */}
                <Card className="sp-card-empty" style={{ marginBottom: '24px' }}>
                    <EmptyState
                        title="Start your first habit"
                        description="Build a practice that supports your values"
                        illustration={
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        }
                        action={
                            <Button variant="secondary" onClick={() => setIsSheetOpen(true)}>
                                Add Habit
                            </Button>
                        }
                    />
                </Card>

                {/* Button Showcase */}
                <Text variant="overline" style={{ marginBottom: '12px' }}>Actions</Text>
                <Stack gap={3} style={{ marginBottom: '24px' }}>
                    <Button variant="primary">Primary Action</Button>
                    <Button variant="secondary">Secondary Action</Button>
                    <Button variant="ghost">Tertiary Action</Button>
                </Stack>

                {/* Input Example */}
                <Input
                    label="Habit name"
                    placeholder="Morning meditation"
                    helperText="Choose something meaningful to you"
                />
            </div>

            {/* Bottom Sheet */}
            <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
                <Stack gap={4}>
                    <Text variant="headline">Add New Habit</Text>
                    <Input label="Name" placeholder="Enter habit name" />
                    <Input label="Duration" placeholder="How long?" />
                    <Stack gap={3}>
                        <Button variant="primary">Create Habit</Button>
                        <Button variant="ghost" onClick={() => setIsSheetOpen(false)}>
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </BottomSheet>
        </div>
    );
};

export default DesignSystemDemo;
