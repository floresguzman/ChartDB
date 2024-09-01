import React, { useCallback, useEffect, useState } from 'react';
import TimeAgo from 'timeago-react';
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from '@/components/menubar/menubar';
import { Label } from '@/components/label/label';
import { Button } from '@/components/button/button';
import { Check, Pencil } from 'lucide-react';
import { Input } from '@/components/input/input';
import { useChartDB } from '@/hooks/use-chartdb';
import { useClickAway, useKeyPressEvent } from 'react-use';
import ChartDBLogo from '@/assets/logo.png';
import { useDialog } from '@/hooks/use-dialog';
import { Badge } from '@/components/badge/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { useExportImage } from '@/hooks/use-export-image';
import { databaseTypeToLabelMap } from '@/lib/databases';
import { DatabaseType } from '@/lib/domain/database-type';
import { useConfig } from '@/hooks/use-config';
import { IS_CHARTDB_IO } from '@/lib/env';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { DiagramIcon } from '@/components/diagram-icon/diagram-icon';
import {
    KeyboardShortcutAction,
    keyboardShortcutsForOS,
} from '@/context/keyboard-shortcuts-context/keyboard-shortcuts';
import { useHistory } from '@/hooks/use-history';

export interface TopNavbarProps {}

export const TopNavbar: React.FC<TopNavbarProps> = () => {
    const {
        diagramName,
        updateDiagramName,
        currentDiagram,
        clearDiagramData,
        deleteDiagram,
    } = useChartDB();
    const {
        openCreateDiagramDialog,
        openOpenDiagramDialog,
        openExportSQLDialog,
        showAlert,
    } = useDialog();
    const { redo, undo, hasRedo, hasUndo } = useHistory();
    const { isMd: isDesktop } = useBreakpoint('md');
    const { config, updateConfig } = useConfig();
    const [editMode, setEditMode] = useState(false);
    const { exportImage } = useExportImage();
    // const { setTheme } = useTheme();
    const [editedDiagramName, setEditedDiagramName] =
        React.useState(diagramName);
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditedDiagramName(diagramName);
    }, [diagramName]);

    const editDiagramName = useCallback(() => {
        if (!editMode) return;
        if (editedDiagramName.trim()) {
            updateDiagramName(editedDiagramName.trim());
        }

        setEditMode(false);
    }, [editedDiagramName, updateDiagramName, editMode]);

    useClickAway(inputRef, editDiagramName);
    useKeyPressEvent('Enter', editDiagramName);

    const createNewDiagram = () => {
        openCreateDiagramDialog();
    };

    const openDiagram = () => {
        openOpenDiagramDialog();
    };

    const enterEditMode = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.stopPropagation();
        setEditMode(true);
    };

    const exportPNG = useCallback(() => {
        exportImage('png');
    }, [exportImage]);

    const exportSVG = useCallback(() => {
        exportImage('svg');
    }, [exportImage]);

    const exportJPG = useCallback(() => {
        exportImage('jpeg');
    }, [exportImage]);

    const openChartDBIO = useCallback(() => {
        window.location.href = 'https://chartdb.io';
    }, []);

    const openJoinDiscord = useCallback(() => {
        window.open('https://discord.gg/QeFwyWSKwC', '_blank');
    }, []);

    const exportSQL = useCallback(
        (databaseType: DatabaseType) => {
            if (databaseType === DatabaseType.GENERIC) {
                openExportSQLDialog({
                    targetDatabaseType: DatabaseType.GENERIC,
                });

                return;
            }

            if (IS_CHARTDB_IO) {
                const now = new Date();
                const lastExportsInLastHalfHour =
                    config?.exportActions?.filter(
                        (date) =>
                            now.getTime() - date.getTime() < 30 * 60 * 1000
                    ) ?? [];

                if (lastExportsInLastHalfHour.length >= 5) {
                    showAlert({
                        title: 'Export SQL Limit Reached',
                        content: (
                            <div className="flex flex-col gap-1 text-sm">
                                <div>
                                    We set a budget to allow the community to
                                    check the feature. You have reached the
                                    limit of 5 AI exports every 30min.
                                </div>
                                <div>
                                    Feel free to use your OPENAI_TOKEN, see the
                                    manual{' '}
                                    <a
                                        href="https://github.com/chartdb/chartdb"
                                        target="_blank"
                                        className="text-pink-600 hover:underline"
                                        rel="noreferrer"
                                    >
                                        here.
                                    </a>
                                </div>
                            </div>
                        ),
                        closeLabel: 'Close',
                    });
                    return;
                }

                updateConfig({
                    exportActions: [...lastExportsInLastHalfHour, now],
                });
            }

            openExportSQLDialog({
                targetDatabaseType: databaseType,
            });
        },
        [config?.exportActions, updateConfig, showAlert, openExportSQLDialog]
    );

    const renderStars = useCallback(() => {
        return (
            <iframe
                src={`https://ghbtns.com/github-btn.html?user=chartdb&repo=chartdb&type=star&size=${isDesktop ? 'large' : 'small'}&text=false`}
                width={isDesktop ? '40' : '25'}
                height={isDesktop ? '30' : '20'}
                title="GitHub"
            ></iframe>
        );
    }, [isDesktop]);

    // const renderDarkModeToggle = () => {
    //     return <DarkModeToggle />;
    // };

    const renderLastSaved = useCallback(() => {
        return (
            <Tooltip>
                <TooltipTrigger>
                    <Badge variant="secondary" className="flex gap-1">
                        {isDesktop ? 'Last saved' : ''}
                        <TimeAgo datetime={currentDiagram.updatedAt} />
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    {currentDiagram.updatedAt.toLocaleString()}
                </TooltipContent>
            </Tooltip>
        );
    }, [currentDiagram.updatedAt, isDesktop]);

    const renderDiagramName = useCallback(() => {
        return (
            <>
                <DiagramIcon diagram={currentDiagram} />
                <div className="flex">
                    {isDesktop ? <Label>Diagrams/</Label> : null}
                </div>
                <div className="flex flex-row items-center gap-1">
                    {editMode ? (
                        <>
                            <Input
                                ref={inputRef}
                                autoFocus
                                type="text"
                                placeholder={diagramName}
                                value={editedDiagramName}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                    setEditedDiagramName(e.target.value)
                                }
                                className="ml-1 h-7 focus-visible:ring-0"
                            />
                            <Button
                                variant="ghost"
                                className="hidden size-7 p-2 text-slate-500 hover:bg-primary-foreground hover:text-slate-700 group-hover:flex"
                                onClick={editDiagramName}
                            >
                                <Check />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Label>{diagramName}</Label>
                            <Button
                                variant="ghost"
                                className="hidden size-7 p-2 text-slate-500 hover:bg-primary-foreground hover:text-slate-700 group-hover:flex"
                                onClick={enterEditMode}
                            >
                                <Pencil />
                            </Button>
                        </>
                    )}
                </div>
            </>
        );
    }, [
        currentDiagram,
        diagramName,
        editDiagramName,
        editMode,
        editedDiagramName,
        isDesktop,
    ]);

    const emojiAI = '✨';

    return (
        <nav className="flex h-20 flex-col justify-between border-b px-4 md:h-12 md:flex-row md:items-center">
            <div className="flex flex-1 justify-between gap-x-3 md:justify-normal">
                <div className="flex py-[10px] font-primary md:items-center md:py-0">
                    <a
                        href="https://chartdb.io"
                        className="cursor-pointer"
                        rel="noreferrer"
                    >
                        <img
                            src={ChartDBLogo}
                            alt="chartDB"
                            className="h-4 max-w-fit"
                        />
                    </a>
                </div>
                <div>
                    <Menubar className="border-none shadow-none">
                        <MenubarMenu>
                            <MenubarTrigger>File</MenubarTrigger>
                            <MenubarContent>
                                <MenubarItem onClick={createNewDiagram}>
                                    New
                                </MenubarItem>
                                <MenubarItem onClick={openDiagram}>
                                    Open
                                </MenubarItem>
                                <MenubarSeparator />
                                <MenubarSub>
                                    <MenubarSubTrigger>
                                        Export SQL
                                    </MenubarSubTrigger>
                                    <MenubarSubContent>
                                        <MenubarItem
                                            onClick={() =>
                                                exportSQL(DatabaseType.GENERIC)
                                            }
                                        >
                                            {databaseTypeToLabelMap['generic']}
                                        </MenubarItem>
                                        <MenubarItem
                                            onClick={() =>
                                                exportSQL(
                                                    DatabaseType.POSTGRESQL
                                                )
                                            }
                                        >
                                            {
                                                databaseTypeToLabelMap[
                                                    'postgresql'
                                                ]
                                            }
                                            <MenubarShortcut className="text-base">
                                                {emojiAI}
                                            </MenubarShortcut>
                                        </MenubarItem>
                                        <MenubarItem
                                            onClick={() =>
                                                exportSQL(DatabaseType.MYSQL)
                                            }
                                        >
                                            {databaseTypeToLabelMap['mysql']}
                                            <MenubarShortcut className="text-base">
                                                {emojiAI}
                                            </MenubarShortcut>
                                        </MenubarItem>
                                        <MenubarItem
                                            onClick={() =>
                                                exportSQL(
                                                    DatabaseType.SQL_SERVER
                                                )
                                            }
                                        >
                                            {
                                                databaseTypeToLabelMap[
                                                    'sql_server'
                                                ]
                                            }
                                            <MenubarShortcut className="text-base">
                                                {emojiAI}
                                            </MenubarShortcut>
                                        </MenubarItem>
                                        <MenubarItem
                                            onClick={() =>
                                                exportSQL(DatabaseType.MARIADB)
                                            }
                                        >
                                            {databaseTypeToLabelMap['mariadb']}
                                            <MenubarShortcut className="text-base">
                                                {emojiAI}
                                            </MenubarShortcut>
                                        </MenubarItem>
                                        <MenubarItem
                                            onClick={() =>
                                                exportSQL(DatabaseType.SQLITE)
                                            }
                                        >
                                            {databaseTypeToLabelMap['sqlite']}
                                            <MenubarShortcut className="text-base">
                                                {emojiAI}
                                            </MenubarShortcut>
                                        </MenubarItem>
                                    </MenubarSubContent>
                                </MenubarSub>
                                <MenubarSub>
                                    <MenubarSubTrigger>
                                        Export as
                                    </MenubarSubTrigger>
                                    <MenubarSubContent>
                                        <MenubarItem onClick={exportPNG}>
                                            PNG
                                        </MenubarItem>
                                        <MenubarItem onClick={exportJPG}>
                                            JPG
                                        </MenubarItem>
                                        <MenubarItem onClick={exportSVG}>
                                            SVG
                                        </MenubarItem>
                                    </MenubarSubContent>
                                </MenubarSub>
                                <MenubarSeparator />
                                <MenubarItem
                                    onClick={() =>
                                        showAlert({
                                            title: 'Delete Diagram',
                                            description:
                                                'This action cannot be undone. This will permanently delete the diagram.',
                                            actionLabel: 'Delete',
                                            closeLabel: 'Cancel',
                                            onAction: deleteDiagram,
                                        })
                                    }
                                >
                                    Delete Diagram
                                </MenubarItem>
                                <MenubarSeparator />
                                <MenubarItem>Exit</MenubarItem>
                            </MenubarContent>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger>Edit</MenubarTrigger>
                            <MenubarContent>
                                <MenubarItem onClick={undo} disabled={!hasUndo}>
                                    Undo
                                    <MenubarShortcut>
                                        {
                                            keyboardShortcutsForOS[
                                                KeyboardShortcutAction.UNDO
                                            ].keyCombinationLabel
                                        }
                                    </MenubarShortcut>
                                </MenubarItem>
                                <MenubarItem onClick={redo} disabled={!hasRedo}>
                                    Redo
                                    <MenubarShortcut>
                                        {
                                            keyboardShortcutsForOS[
                                                KeyboardShortcutAction.REDO
                                            ].keyCombinationLabel
                                        }
                                    </MenubarShortcut>
                                </MenubarItem>
                                <MenubarSeparator />
                                <MenubarItem
                                    onClick={() =>
                                        showAlert({
                                            title: 'Clear Diagram',
                                            description:
                                                'This action cannot be undone. This will permanently delete all the data in the diagram.',
                                            actionLabel: 'Clear',
                                            closeLabel: 'Cancel',
                                            onAction: clearDiagramData,
                                        })
                                    }
                                >
                                    Clear
                                </MenubarItem>
                            </MenubarContent>
                        </MenubarMenu>
                        {/* <MenubarMenu>
                            <MenubarTrigger>View</MenubarTrigger>
                            <MenubarContent>
                                <MenubarSub>
                                    <MenubarSubTrigger>Theme</MenubarSubTrigger>
                                    <MenubarSubContent>
                                        <MenubarItem
                                            onClick={() => setTheme('light')}
                                        >
                                            Light
                                        </MenubarItem>
                                        <MenubarItem
                                            onClick={() => setTheme('dark')}
                                        >
                                            Dark
                                        </MenubarItem>
                                        <MenubarItem
                                            onClick={() => {
                                                localStorage.removeItem(
                                                    'theme'
                                                );

                                                setTheme('system');
                                            }}
                                        >
                                            System
                                        </MenubarItem>
                                    </MenubarSubContent>
                                </MenubarSub>
                            </MenubarContent>
                        </MenubarMenu> */}
                        <MenubarMenu>
                            <MenubarTrigger>Help</MenubarTrigger>
                            <MenubarContent>
                                <MenubarItem onClick={openChartDBIO}>
                                    Visit ChartDB
                                </MenubarItem>
                                <MenubarItem onClick={openJoinDiscord}>
                                    Join us on Discord
                                </MenubarItem>
                            </MenubarContent>
                        </MenubarMenu>
                    </Menubar>
                </div>
            </div>
            {isDesktop ? (
                <>
                    <div className="group flex flex-1 flex-row items-center justify-center">
                        {renderDiagramName()}
                    </div>
                    <div className="hidden flex-1 items-center justify-end gap-2 sm:flex">
                        {renderLastSaved()}
                        {renderStars()}
                        {/* {renderDarkModeToggle()} */}
                    </div>
                </>
            ) : (
                <div className="flex flex-1 flex-row justify-between gap-2">
                    <div className="group flex flex-1 flex-row items-center">
                        {renderDiagramName()}
                    </div>
                    <div className="flex items-center">{renderLastSaved()}</div>
                    <div className="flex items-center">{renderStars()}</div>
                    {/* <div className="flex justify-center items-center">
                        {renderDarkModeToggle()}
                    </div> */}
                </div>
            )}
        </nav>
    );
};
