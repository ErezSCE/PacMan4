describe('Service Worker registration in main.tsx', () => {
  const originalNavigator = { ...global.navigator };

  afterEach(() => {
    // Restore original navigator
    // @ts-ignore
    global.navigator = originalNavigator;
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('registers service worker and sets up listeners when supported', async () => {
    const registerMock = jest.fn().mockResolvedValue({
      addEventListener: jest.fn(),
      installing: { addEventListener: jest.fn() },
    });
    // @ts-ignore
    global.navigator.serviceWorker = {
      register: registerMock,
      addEventListener: jest.fn(),
    } as any;

    // Set up a root element for React rendering
    const rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    document.body.appendChild(rootDiv);
    // Import the module after setting up the mock and DOM
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../main.tsx');

    // Simulate window load event
    window.dispatchEvent(new Event('load'));

    // Wait for the async registration promise to resolve
    await Promise.resolve(); // allow microtasks

    expect(registerMock).toHaveBeenCalledWith('/service-worker.js');
    const registration = await registerMock.mock.results[0].value;
    expect(registration.addEventListener).toHaveBeenCalledWith(
      'updatefound',
      expect.any(Function)
    );
    expect(global.navigator.serviceWorker.addEventListener).toHaveBeenCalledWith(
      'controllerchange',
      expect.any(Function)
    );
  });

  test('does nothing when service workers are not supported', () => {
    // @ts-ignore
    delete global.navigator.serviceWorker;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Import the module
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../main.tsx');
    // Simulate load event
    window.dispatchEvent(new Event('load'));
    // No registration should happen, so no console errors
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
